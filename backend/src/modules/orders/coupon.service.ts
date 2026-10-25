import type { Coupon } from "@/db/schema/coupons.js";
import type { DbTransaction } from "@/db/client.js";
import { AppError } from "@/middlewares/errorHandler.js";
import type { CouponValidation } from "@/types/orders.js";
import * as repo from "./coupon.repository.js";
import { roundMoney } from "./money.js";

/**
 * Applies a coupon row to a subtotal (pure, so the same rules run for
 * `POST /coupons/validate` and checkout). Invalid / expired / exhausted codes
 * and unmet minimums never throw here: the endpoint answers 200 with a reason.
 */
export function evaluateCoupon(
  coupon: Coupon,
  subtotal: number,
  now: Date = new Date(),
): CouponValidation {
  const expired = coupon.expiresAt !== null && coupon.expiresAt.getTime() <= now.getTime();
  const exhausted = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
  if (!coupon.isActive || expired || exhausted) {
    return { valid: false, error: "invalid" };
  }

  const minOrder = Number(coupon.minOrder);
  if (subtotal < minOrder) {
    return { valid: false, error: "min-order" };
  }

  const value = Number(coupon.value);
  const maxDiscount = coupon.maxDiscount === null ? undefined : Number(coupon.maxDiscount);

  let discount = 0;
  if (!coupon.freeShipping) {
    const raw = coupon.type === "percent" ? (subtotal * value) / 100 : value;
    discount = Math.min(raw, maxDiscount ?? raw, subtotal);
  }

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value,
    ...(maxDiscount === undefined ? {} : { maxDiscount }),
    ...(coupon.freeShipping ? { freeShipping: true } : {}),
    discount: roundMoney(discount),
  };
}

/** `POST /coupons/validate`: unknown codes are reported as `invalid`, never 404. */
export async function validateCouponCode(
  code: string,
  subtotal: number,
): Promise<CouponValidation> {
  const coupon = await repo.findCouponByCode(code);
  return coupon === undefined ? { valid: false, error: "invalid" } : evaluateCoupon(coupon, subtotal);
}

/**
 * Checkout variant: locks the row (usage limit) and rejects the order with a
 * 422 when the code is not usable, so a total is never computed with a bad
 * coupon. Called inside the checkout transaction.
 */
export async function resolveCouponForCheckout(
  tx: DbTransaction,
  code: string,
  subtotal: number,
): Promise<{ coupon: Coupon; validation: Extract<CouponValidation, { valid: true }> }> {
  const coupon = await repo.findCouponByCodeForUpdate(tx, code);
  if (coupon === undefined) {
    const message = "Coupon is invalid or has expired";
    throw new AppError("UNPROCESSABLE_ENTITY", 422, message, [{ path: "couponCode", message }]);
  }

  const validation = evaluateCoupon(coupon, subtotal);
  if (!validation.valid) {
    const message =
      validation.error === "min-order"
        ? "Order does not meet the coupon minimum"
        : "Coupon is invalid or has expired";
    throw new AppError("UNPROCESSABLE_ENTITY", 422, message, [
      { path: "couponCode", message },
    ]);
  }

  return { coupon, validation };
}
