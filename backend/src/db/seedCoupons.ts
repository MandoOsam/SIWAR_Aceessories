import { db } from "@/db/client.js";
import { coupons, type NewCoupon } from "@/db/schema/coupons.js";

/**
 * Starter coupons that mirror the storefront mock (F5.1). Idempotent: existing
 * codes are left untouched so dashboard edits survive `db:seed`.
 */
const couponSeeds: NewCoupon[] = [
  { code: "SIWAR10", type: "percent", value: "10", minOrder: "0" },
  { code: "WELCOME50", type: "fixed", value: "50", minOrder: "300" },
  { code: "FREESHIP", type: "fixed", value: "0", freeShipping: true, minOrder: "0" },
];

export async function seedCoupons(): Promise<number> {
  const inserted = await db
    .insert(coupons)
    .values(couponSeeds)
    .onConflictDoNothing({ target: coupons.code })
    .returning({ id: coupons.id });
  return inserted.length;
}
