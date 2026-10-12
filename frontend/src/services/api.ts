/**
 * The single data entry point for the storefront.
 *
 * Components and hooks import from here, never from `src/data/` and never call `fetch`
 * directly (03-code-standards.md §5). Swapping mock data for `backend/` is done by setting
 * `VITE_API_URL`; nothing in the UI changes.
 */

export * from "./types";
export { ApiError } from "./http";
export {
  getCategoryBySlug,
  getProductBySlug,
  listCategories,
  listProducts,
  searchSuggest,
  validateCoupon,
} from "./catalogService";
export type { CouponError, CouponValidation } from "./catalogService";
export {
  createOrder,
  getPaymentMethods,
  getShippingOptions,
  listGovernorates,
  OrderError,
} from "./checkoutService";
export type { OrderErrorCode } from "./checkoutService";
export {
  getHomeContent,
  getProductReviews,
  getPublicSettings,
  getStaticPage,
  listReviews,
  listStaticPages,
  submitProductReview,
} from "./contentService";


export async function subscribeNewsletter(email: string): Promise<{ ok: boolean }> {
  void email;
  return { ok: true };
}
