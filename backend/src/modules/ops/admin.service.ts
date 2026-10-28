import { db } from "@/db/client.js";
import { activityLog } from "@/db/schema/activityLog.js";
import { campaigns } from "@/db/schema/campaigns.js";
import { inventoryMovements } from "@/db/schema/inventoryMovements.js";
import { notifications } from "@/db/schema/notifications.js";
import { orders } from "@/db/schema/orders.js";
import { products } from "@/db/schema/products.js";
import { users } from "@/db/schema/users.js";
import { and, desc, eq, gte, ilike, sql } from "drizzle-orm";
import { ADMIN_NOTIFICATION_TARGET } from "@/types/notifications.js";

export async function logActivity(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(activityLog).values({
      actorId: input.actorId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      meta: input.meta ?? null,
    });
  } catch {
    /* best effort */
  }
}

export async function getDashboard(range: "7d" | "30d" | "90d") {
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [ordersRows, revenueRows, customersRows, lowStockRows, recentOrders] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(gte(orders.createdAt, since)),
      db
        .select({ total: sql<number>`coalesce(sum(${orders.total}),0)::numeric` })
        .from(orders)
        .where(gte(orders.createdAt, since)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(and(eq(users.role, "customer"), gte(users.createdAt, since))),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(sql`${products.stock} <= ${products.lowStockThreshold}`),
      db
        .select({
          id: orders.id,
          number: orders.number,
          customerName: orders.customerName,
          total: orders.total,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(10),
    ]);

  return {
    range,
    orders: ordersRows[0]?.count ?? 0,
    revenue: Number(revenueRows[0]?.total ?? 0),
    newCustomers: customersRows[0]?.count ?? 0,
    lowStock: lowStockRows[0]?.count ?? 0,
    recentOrders,
  };
}

export async function listInventory(opts: {
  page: number;
  limit: number;
  search?: string;
  lowStock?: boolean;
}) {
  const conditions = [];
  if (opts.search) {
    const pattern = `%${opts.search}%`;
    conditions.push(ilike(products.name, pattern));
  }
  if (opts.lowStock) {
    conditions.push(sql`${products.stock} <= ${products.lowStockThreshold}`);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (opts.page - 1) * opts.limit;
  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        stock: products.stock,
        lowStockThreshold: products.lowStockThreshold,
        price: products.price,
        status: products.status,
      })
      .from(products)
      .where(where)
      .orderBy(products.sku)
      .limit(opts.limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(products).where(where),
  ]);
  return { data: rows, total: countRows[0]?.total ?? 0, page: opts.page, limit: opts.limit };
}

export async function adjustInventory(
  productId: string,
  delta: number,
  reason: string,
  actorId?: string | null,
) {
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(products).where(eq(products.id, productId)).for("update").limit(1);
    const product = rows[0];
    if (!product) throw new Error("NOT_FOUND");
    const newStock = product.stock + delta;
    if (newStock < 0) throw new Error("BAD_REQUEST");
    await tx.update(products).set({ stock: newStock, updatedAt: new Date() }).where(eq(products.id, productId));
    await tx.insert(inventoryMovements).values({ productId, delta, reason, actorId: actorId ?? null });
    await logActivity({ actorId, action: "inventory.adjust", entity: "product", entityId: productId, meta: { delta, reason } });
    return { productId, stock: newStock };
  });
}

export async function listCampaigns() {
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function createCampaign(data: typeof campaigns.$inferInsert) {
  const [row] = await db.insert(campaigns).values(data).returning();
  return row;
}

export async function updateCampaign(id: string, data: Partial<typeof campaigns.$inferInsert>) {
  const [row] = await db.update(campaigns).set({ ...data, updatedAt: new Date() }).where(eq(campaigns.id, id)).returning();
  return row;
}

export async function deleteCampaign(id: string) {
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

export async function listAdminNotifications(opts: { page: number; limit: number }) {
  const where = eq(notifications.target, ADMIN_NOTIFICATION_TARGET);
  const offset = (opts.page - 1) * opts.limit;
  const [rows, countRows] = await Promise.all([
    db.select().from(notifications).where(where).orderBy(desc(notifications.createdAt)).limit(opts.limit).offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(notifications).where(where),
  ]);
  return { data: rows, total: countRows[0]?.total ?? 0, page: opts.page, limit: opts.limit };
}

export async function listActivity(opts: { page: number; limit: number; actorId?: string; action?: string; entity?: string }) {
  const conditions = [];
  if (opts.actorId) conditions.push(eq(activityLog.actorId, opts.actorId));
  if (opts.action) conditions.push(eq(activityLog.action, opts.action));
  if (opts.entity) conditions.push(eq(activityLog.entity, opts.entity));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (opts.page - 1) * opts.limit;
  const [rows, countRows] = await Promise.all([
    db.select().from(activityLog).where(where).orderBy(desc(activityLog.createdAt)).limit(opts.limit).offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(activityLog).where(where),
  ]);
  return { data: rows, total: countRows[0]?.total ?? 0, page: opts.page, limit: opts.limit };
}
