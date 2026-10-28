import { and, desc, eq, notInArray, or, sql, type SQL } from "drizzle-orm";

import { db, type DbTransaction } from "@/db/client.js";
import { orderItems } from "@/db/schema/orderItems.js";
import { orders } from "@/db/schema/orders.js";
import { products } from "@/db/schema/products.js";
import { reviews, type NewReview, type Review } from "@/db/schema/reviews.js";
import type { ReviewStatus } from "@/types/reviews.js";

const APPROVED: ReviewStatus = "approved";

export type PublicReviewFilters = {
  productId?: string;
  showOnHome?: boolean;
  page: number;
  limit: number;
};

export type AdminReviewFilters = {
  status?: ReviewStatus;
  productId?: string;
  page: number;
  limit: number;
};

function publicConditions(filters: PublicReviewFilters): SQL {
  const conditions: SQL[] = [eq(reviews.status, APPROVED)];

  if (filters.productId !== undefined) {
    const match = or(eq(reviews.productId, filters.productId), eq(reviews.isSeed, true));
    if (match !== undefined) conditions.push(match);
  }
  if (filters.showOnHome === true) {
    conditions.push(eq(reviews.showOnHome, true));
  }

  return and(...conditions) ?? conditions[0]!;
}

async function listWhere(
  where: SQL | undefined,
  page: number,
  limit: number,
): Promise<{ rows: Review[]; total: number }> {
  const offset = (page - 1) * limit;
  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(reviews)
      .where(where)
      .orderBy(desc(reviews.createdAt), desc(reviews.id))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(reviews).where(where),
  ]);
  return { rows, total: countRows[0]?.total ?? 0 };
}

export function listPublicReviews(filters: PublicReviewFilters) {
  return listWhere(publicConditions(filters), filters.page, filters.limit);
}

export function listAdminReviews(filters: AdminReviewFilters) {
  const conditions: SQL[] = [];
  if (filters.status !== undefined) conditions.push(eq(reviews.status, filters.status));
  if (filters.productId !== undefined) {
    conditions.push(eq(reviews.productId, filters.productId));
  }
  const where = conditions.length === 0 ? undefined : and(...conditions);
  return listWhere(where, filters.page, filters.limit);
}

export async function findReviewById(id: string): Promise<Review | undefined> {
  const rows = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return rows[0];
}

export async function findActiveProductById(id: string) {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, id), eq(products.status, "active")))
    .limit(1);
  return rows[0];
}

export async function findReviewByUserAndProduct(
  userId: string,
  productId: string,
): Promise<Review | undefined> {
  const [row] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
    .limit(1);
  return row;
}

/** True when the customer has a non-cancelled order that contains the product. */
export async function hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const rows = await db
    .select({ found: sql<number>`1` })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orderItems.productId, productId),
        notInArray(orders.status, ["cancelled", "refunded"]),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function insertReview(values: NewReview): Promise<Review> {
  const [row] = await db.insert(reviews).values(values).returning();
  if (row === undefined) throw new Error("Could not create the review");
  return row;
}

export async function findReviewForUpdate(
  tx: DbTransaction,
  id: string,
): Promise<Review | undefined> {
  const rows = await tx.select().from(reviews).where(eq(reviews.id, id)).for("update").limit(1);
  return rows[0];
}

export async function updateReviewStatus(
  tx: DbTransaction,
  id: string,
  values: { status?: ReviewStatus; showOnHome?: boolean },
): Promise<Review | undefined> {
  const [row] = await tx
    .update(reviews)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(reviews.id, id))
    .returning();
  return row;
}

export async function deleteReview(tx: DbTransaction, id: string): Promise<void> {
  await tx.delete(reviews).where(eq(reviews.id, id));
}

/**
 * Recomputes the denormalised product rating from approved reviews (D-085).
 * Runs inside the moderation transaction so the list and the moderation
 * response can never disagree.
 */
export async function recalculateProductRating(
  tx: DbTransaction,
  productId: string,
): Promise<void> {
  await tx.execute(sql`
    update "products" set
      "rating" = coalesce((
        select round(avg("rating")::numeric, 1)
        from "reviews"
        where "product_id" = ${productId} and "status" = 'approved'
      ), 0),
      "reviews_count" = (
        select count(*)::int
        from "reviews"
        where "product_id" = ${productId} and "status" = 'approved'
      ),
      "updated_at" = now()
    where "id" = ${productId}
  `);
}
