/**
 * Pure helpers for the product page.
 *
 * Kept out of the components (03-code-standards.md §2) so `clampQuantity` and `resolveStockStatus`
 * can be unit-tested without a DOM, and so `ProductActions` and `StickyAddToCart` build the cart
 * line the same way instead of duplicating the mapping.
 */

import type { Product } from "@/services/types";
import type { CartItem, CartVariant } from "@/store/cartStore";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

/** Stock at or below this reads as "low stock" (05-ui-context.md §7.5). */
export const LOW_STOCK_THRESHOLD = 5;

/** Fallback quantity ceiling when a product has no trackable stock (05-ui-context.md §7.5). */
export const FALLBACK_MAX_QTY = 10;

/**
 * Clamps a quantity into `[min, max]`.
 *
 * Non-finite input (empty field, `NaN`) falls back to `min`, and floats are truncated so the
 * stepper never produces a fractional quantity.
 */
export function clampQuantity(value: number, min: number, max: number): number {
  const safeMax = Math.max(min, max);
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(Math.trunc(value), min), safeMax);
}

export function resolveStockStatus(stock: number): StockStatus {
  if (stock <= 0) {
    return "out-of-stock";
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return "low-stock";
  }
  return "in-stock";
}

/** Builds the cart line for `useCartStore.addItem` from the product page selection. */
export function buildCartItem(
  product: Product,
  variant: CartVariant,
  quantity: number,
): Omit<CartItem, "key"> {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: primaryImage?.url ?? "",
    price: product.price,
    qty: quantity,
    variant,
    maxQty: product.stock > 0 ? product.stock : 1,
  };
}
