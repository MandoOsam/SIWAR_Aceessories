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
  login: "/login",
  trackOrder: "/track-order",
} as const;
