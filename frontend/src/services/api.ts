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
} from "./catalogService";
export {
  getHomeContent,
  getPublicSettings,
  getStaticPage,
  listReviews,
  listStaticPages,
} from "./contentService";
