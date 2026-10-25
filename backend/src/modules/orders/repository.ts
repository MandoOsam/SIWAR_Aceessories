import { and, asc, desc, eq, gte, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { db, type DbTransaction } from "@/db/client.js";
import { orderEvents, type NewOrderEvent } from "@/db/schema/orderEvents.js";
import { orderItems, type NewOrderItem } from "@/db/schema/orderItems.js";
import { orders, type NewOrder, type Order } from "@/db/schema/orders.js";
import { productImages } from "@/db/schema/productImages.js";
import { products, type Product } from "@/db/schema/products.js";
import { storeSettings, type StoreSettingsRow } from "@/db/schema/storeSettings.js";
import type { OrderEvent } from "@/db/schema/orderEvents.js";
import type { OrderItem } from "@/db/schema/orderItems.js";
import type { OrderListFilters, OrderState, PaymentStatus } from "@/types/orders.js";

/** Escapes LIKE wildcards so a search for "50%" is a literal search. */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function findSettings(): Promise<StoreSettingsRow | undefined> {
  const rows = await db.select().from(storeSettings).limit(1);
  return rows[0];
}

/** Locks the requested product rows so stock checks and decrements are atomic. */
export function findProductsForUpdate(tx: DbTransaction, ids: string[]): Promise<Product[]> {
  return tx.select().from(products).where(inArray(products.id, ids)).for("update");
}

/** Primary-first image per product, for the order-line snapshot. */
export async function findPrimaryImages(
  tx: DbTransaction,
  productIds: string[],
): Promise<Map<string, string>> {
  if (productIds.length === 0) return new Map();
  const rows = await tx
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

  const images = new Map<string, string>();
  for (const row of rows) {
    if (!images.has(row.productId)) images.set(row.productId, row.url);
  }
  return images;
}

/** Allocates the next `SW-xxxxx` number from the database sequence (D-081). */
export async function allocateOrderNumber(tx: DbTransaction): Promise<string> {
  const result = await tx.execute(sql`select nextval('order_number_seq')::int as value`);
  const row = result.rows[0] as { value: number } | undefined;
  if (row === undefined) throw new Error("Could not allocate an order number");
  return `SW-${row.value}`;
}

export async function insertOrder(tx: DbTransaction, values: NewOrder): Promise<Order> {
  const [order] = await tx.insert(orders).values(values).returning();
  if (order === undefined) throw new Error("Could not create the order");
  return order;
}

export function insertOrderItems(tx: DbTransaction, values: NewOrderItem[]) {
  return tx.insert(orderItems).values(values);
}

export function insertOrderEvent(tx: DbTransaction, values: NewOrderEvent) {
  return tx.insert(orderEvents).values(values);
}

export function decrementStock(tx: DbTransaction, productId: string, qty: number) {
  return tx
    .update(products)
    .set({ stock: sql`${products.stock} - ${qty}`, updatedAt: new Date() })
    .where(and(eq(products.id, productId), gte(products.stock, qty)))
    .returning({ id: products.id });
}

function listConditions(filters: OrderListFilters): SQL[] {
  const conditions: SQL[] = [];
  if (filters.status !== undefined) conditions.push(eq(orders.status, filters.status));
  if (filters.paymentStatus !== undefined) {
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  }
  if (filters.search !== undefined && filters.search !== "") {
    const pattern = `%${escapeLike(filters.search)}%`;
    const search = or(
      ilike(orders.number, pattern),
      ilike(orders.customerName, pattern),
      ilike(orders.phone, pattern),
    );
    if (search !== undefined) conditions.push(search);
  }
  return conditions;
}

export async function listOrders(
  filters: OrderListFilters,
): Promise<{ rows: Order[]; total: number }> {
  const where = and(...listConditions(filters));
  const offset = (filters.page - 1) * filters.limit;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(filters.limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(orders).where(where),
  ]);

  return { rows, total: countRows[0]?.total ?? 0 };
}

export function findOrderById(id: string): Promise<Order | undefined> {
  return db.query.orders.findFirst({ where: eq(orders.id, id) });
}

export async function findOrderForUpdate(
  tx: DbTransaction,
  id: string,
): Promise<Order | undefined> {
  const rows = await tx.select().from(orders).where(eq(orders.id, id)).limit(1).for("update");
  return rows[0];
}

/** Guest tracking: number is case-insensitive; phones compare on their last 10 digits. */
export async function findOrderByNumberAndPhone(
  number: string,
  phoneDigits: string,
): Promise<Order | undefined> {
  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(sql`upper(${orders.number})`, number),
        eq(sql`right(regexp_replace(${orders.phone}, '[^0-9]', '', 'g'), 10)`, phoneDigits.slice(-10)),
      ),
    )
    .limit(1);
  return rows[0];
}

export function findOrderItems(orderIds: string[]): Promise<OrderItem[]> {
  if (orderIds.length === 0) return Promise.resolve([]);
  return db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.createdAt), asc(orderItems.id));
}

export function findOrderEvents(orderIds: string[]): Promise<OrderEvent[]> {
  if (orderIds.length === 0) return Promise.resolve([]);
  return db
    .select()
    .from(orderEvents)
    .where(inArray(orderEvents.orderId, orderIds))
    .orderBy(asc(orderEvents.createdAt), asc(orderEvents.id));
}

export function updateOrderStatus(tx: DbTransaction, id: string, status: OrderState) {
  return tx.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
}

export function updateOrderPayment(
  tx: DbTransaction,
  id: string,
  paymentStatus: PaymentStatus,
) {
  return tx
    .update(orders)
    .set({ paymentStatus, updatedAt: new Date() })
    .where(eq(orders.id, id));
}
