import { eq, sql } from "drizzle-orm";

import { db, type DbTransaction } from "@/db/client.js";
import { coupons, type Coupon } from "@/db/schema/coupons.js";

export function findCouponByCode(code: string): Promise<Coupon | undefined> {
  return db.query.coupons.findFirst({ where: eq(coupons.code, code) });
}

/** Locks the coupon row so usage-limit checks cannot race during checkout. */
export async function findCouponByCodeForUpdate(
  tx: DbTransaction,
  code: string,
): Promise<Coupon | undefined> {
  const rows = await tx.select().from(coupons).where(eq(coupons.code, code)).limit(1).for("update");
  return rows[0];
}

export function incrementCouponUsage(tx: DbTransaction, id: string) {
  return tx
    .update(coupons)
    .set({ usedCount: sql`${coupons.usedCount} + 1`, updatedAt: new Date() })
    .where(eq(coupons.id, id));
}
