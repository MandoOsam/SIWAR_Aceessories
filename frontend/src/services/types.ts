/**
 * Shared API contract types.
 *
 * Copied from the contract in `context/02-architecture.md` section 4 and section 7, plus the
 * storefront shapes in `context/05-ui-context.md` section 6. If the contract changes, this file
 * changes first, then the code that uses it.
 *
 * Conventions: ids are UUID strings, money is a number in EGP, dates are ISO 8601 UTC,
 * bilingual fields are `{ ar, en }`.
 */

/** Bilingual field. Both languages are always present; the UI picks one via i18n. */
export type L10n = { ar: string; en: string };

export const CATEGORY_SLUGS = ["necklaces", "rings", "bracelets", "earrings", "sets"] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const PRODUCT_COLORS = ["gold", "silver", "rose-gold", "black"] as const;

export type ProductColor = (typeof PRODUCT_COLORS)[number];

export type ProductImage = {
  url: string;
  alt: L10n;
  isPrimary: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: L10n;
  description: L10n;
  category: Category;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  images: ProductImage[];
  colors: ProductColor[];
  /** Present for rings only. */
  sizes?: string[];
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  material: "stainless-steel";
  plating?: L10n;
  waterResistant: boolean;
  hypoallergenic: boolean;
  createdAt: string;
};

export type Category = {
  id: string;
  slug: CategorySlug;
  name: L10n;
  description: L10n;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export type ProductQuery = {
  category?: CategorySlug;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  color?: ProductColor;
  size?: string;
  discount?: boolean;
  isNew?: boolean;
  sort?: ProductSort;
  page?: number;
  limit?: number;
  search?: string;
};

export const PRODUCT_SORTS = [
  "newest",
  "best-selling",
  "price-asc",
  "price-desc",
  "rating",
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type Review = {
  id: string;
  productId?: string;
  authorName: string;
  governorate?: L10n;
  rating: number;
  text: L10n;
  images: string[];
  status: "pending" | "approved" | "hidden";
  /** Seeded reviews are samples and must never show a "Verified purchase" badge. */
  isSeed: boolean;
  isVerifiedPurchase: boolean;
  showOnHome: boolean;
  createdAt: string;
};

/** Body of `POST /products/:id/reviews` (02-architecture.md §7). Submitted reviews go to `pending`. */
export type ProductReviewInput = {
  authorName: string;
  /** 1–5, validated server-side (02-architecture.md §6). */
  rating: number;
  text: L10n;
  images?: string[];
};

export const TRUST_BADGE_KEYS = ["shipping", "payment", "returns", "support"] as const;

export type TrustBadgeKey = (typeof TRUST_BADGE_KEYS)[number];

export type PaymentMethodId = "cod" | "instapay" | "vodafone-cash";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: L10n;
  isEnabled: boolean;
  instructions?: L10n;
  accountValue?: string;
};

export type StoreSettings = {
  storeName: string;
  currency: "EGP";
  shipping: {
    defaultFee: number;
    freeAbove?: number;
  };
  paymentMethods: PaymentMethod[];
  trustBadges: Record<TrustBadgeKey, L10n>;
  social: { platform: "instagram" | "tiktok" | "facebook"; url: string }[];
  contact: { phone: string; email: string; whatsapp?: string };
};

/** A delivery service the customer picks at checkout. Source: `GET /shipping/options`. */
export type ShippingOption = {
  id: string;
  name: L10n;
  /** Base fee in EGP, before any "free above" rule. */
  fee: number;
  /** Estimated delivery window in days. */
  minDays: number;
  maxDays: number;
  /** Order subtotal at or above which this option is free. */
  freeAbove?: number;
};

/** Egyptian governorate for the address step. Source: `GET /shipping/governorates`. */
export type Governorate = {
  value: string;
  name: L10n;
};

/** Customer details captured at checkout (`POST /orders`, 02-architecture.md §7). */
export type OrderCustomer = {
  name: string;
  phone: string;
  email?: string;
};

export type OrderAddress = {
  governorate: string;
  city: string;
  street: string;
  building?: string;
  apartment?: string;
  notes?: string;
};

export type OrderLineInput = {
  productId: string;
  variant: { color?: string; size?: string };
  qty: number;
};

/** Body of `POST /orders`. */
export type OrderInput = {
  customer: OrderCustomer;
  address: OrderAddress;
  deliveryOptionId: string;
  paymentMethod: PaymentMethodId;
  /** Screenshot URL for a transfer method; real uploads arrive in F6. */
  paymentProofUrl?: string;
  items: OrderLineInput[];
  couponCode?: string;
};

export type OrderResult = {
  id: string;
  number: string;
  /** Grand total the server computed; the client never decides the price (02-architecture.md §10). */
  total: number;
};

/** Linear fulfilment path shown by the order timeline. */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;
/** Terminal states that stop the linear path (shown differently on the timeline). */
export const ORDER_TERMINAL_STATUSES = ["cancelled", "returned", "refunded"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderTerminalStatus = (typeof ORDER_TERMINAL_STATUSES)[number];
export type OrderState = OrderStatus | OrderTerminalStatus;

export type OrderItem = {
  productId: string;
  name: L10n;
  imageUrl?: string;
  variant?: { color?: string; size?: string };
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  number: string;
  status: OrderState;
  customer: OrderCustomer;
  address: OrderAddress;
  deliveryOptionId: string;
  paymentMethod: PaymentMethodId;
  paymentProofUrl?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  estimatedDelivery?: string;
};

export type HeroContent = {
  headline: L10n;
  /** One word is styled italic for the dark-feminine look. */
  headlineAccent: L10n;
  subline: L10n;
  primaryCta: { label: L10n; href: string };
  secondaryCta: { label: L10n; href: string };
  backgroundUrl?: string;
  posterUrl?: string;
};

export type HomeContent = {
  hero: HeroContent;
  story: { title: L10n; body: L10n; imageUrl: string; ctaLabel: L10n; ctaHref: string };
  featuredCollections: {
    id: string;
    title: L10n;
    subtitle: L10n;
    imageUrl: string;
    href: string;
  }[];
};

export type StaticPage = {
  slug: string;
  title: L10n;
  body: L10n;
};

export type SearchSuggestion = {
  type: "product" | "category" | "query";
  label: L10n;
  href: string;
  imageUrl?: string;
};

export type SearchSuggestResponse = {
  suggestions: SearchSuggestion[];
  popularSearches: L10n[];
};

/** List envelope shared by every collection endpoint (02-architecture.md section 4). */
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type ProductDetail = {
  product: Product;
  related: Product[];
  matching: Product[];
};

/**
 * Signed-in customer (`GET /auth/me`, `PATCH /account/profile`).
 *
 * The storefront only ever sees `role: "customer"`; staff roles exist in the admin app
 * (02-architecture.md §5). The session itself is an httpOnly cookie, never a client value.
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer";
  createdAt: string;
};

/** Body of `POST /auth/login`. */
export type LoginInput = {
  email: string;
  password: string;
};

/** Body of `POST /auth/register`. */
export type RegisterInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

/** Body of `POST /auth/forgot-password`. */
export type ForgotPasswordInput = {
  email: string;
};

/** Body of `POST /auth/reset-password`. */
export type ResetPasswordInput = {
  token: string;
  password: string;
};

export const PASSWORD_STRENGTHS = ["weak", "medium", "strong"] as const;

export type PasswordStrength = (typeof PASSWORD_STRENGTHS)[number];
