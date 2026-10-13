/**
 * Product defaults that are not editable from the admin dashboard.
 *
 * Everything the owner is meant to change (products, categories, hero copy, banners, story,
 * reviews, trust badges, shipping fee, payment methods, social links) must come from the data
 * layer, never from here (05-ui-context.md section 6).
 */

export const BRAND_NAME = "SIWAR";

export const DEFAULT_LOCALE = "ar" as const;

export const SUPPORTED_LOCALES = ["ar", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DIRECTION_BY_LOCALE: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};

export const DEFAULT_THEME = "dark" as const;

export const STORAGE_KEYS = {
  theme: "siwar-theme",
  locale: "siwar-locale",
  cart: "siwar-cart",
  /** Mock-only: keeps placed orders readable after a page refresh until the real API exists. */
  mockOrders: "siwar.mock.orders",
  /**
   * Mock-only: the mock account profiles the auth service reads. Never contains a password —
   * passwords stay in memory. Removed once `VITE_API_URL` points at the real API (D-046).
   */
  mockUsers: "siwar.mock.users",
  /** Mock-only: which mock user is signed in; the real app uses an httpOnly cookie (D-046). */
  mockSession: "siwar.mock.auth",
  /** Client wishlist of product ids; allowed client storage (03-code-standards.md §5). */
  wishlist: "siwar.wishlist",
  /** Mock notifications, shown until the real API exists (`GET /account/notifications`). */
  notifications: "siwar.notifications",
  /** Mock-only: saved delivery addresses (`/account/addresses`). */
  mockAddresses: "siwar.mock.addresses",
} as const;

/** `GET /products` defaults (02-architecture.md section 7). */
export const DEFAULT_PAGE_LIMIT = 20;

export const MAX_PAGE_LIMIT = 100;

/** Fixed navigation destination, so no component hard-codes a route string. */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  category: (slug: string) => `/category/${slug}`,
  product: (slug: string) => `/products/${slug}`,
  search: "/search",
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: (id: string) => `/order/success/${id}`,
  wishlist: "/wishlist",
  account: "/account",
  accountProfile: "/account/profile",
  accountPassword: "/account/password",
  accountOrders: "/account/orders",
  accountOrderDetails: (id: string) => `/account/orders/${id}`,
  accountWishlist: "/account/wishlist",
  accountAddresses: "/account/addresses",
  accountNotifications: "/account/notifications",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: (token: string) => `/reset-password/${token}`,
  trackOrder: "/track-order",
} as const;
