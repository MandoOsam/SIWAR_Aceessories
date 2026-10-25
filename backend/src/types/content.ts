import type { L10n, Seo } from "./l10n.js";

/** Call to action used by the home blocks. `href` may be a storefront path. */
export type Cta = { label: L10n; href: string };

/** Hero block (`content_blocks.key = "hero"`). */
export type HeroContent = {
  headline: L10n;
  headlineAccent: L10n;
  subline: L10n;
  primaryCta: Cta;
  secondaryCta: Cta;
  posterUrl?: string;
};

/** Story block (`content_blocks.key = "story"`). */
export type StoryContent = {
  title: L10n;
  body: L10n;
  imageUrl: string;
  ctaLabel: L10n;
  ctaHref: string;
};

/**
 * Featured collection (`content_blocks.key = "featured:<id>"`). The id is the
 * key suffix, so the same collection keeps its identity when edited.
 */
export type FeaturedCollection = {
  id: string;
  title: L10n;
  subtitle: L10n;
  imageUrl: string;
  href: string;
};

/** `GET /content/home` payload. */
export type HomeContent = {
  hero: HeroContent;
  story: StoryContent;
  featuredCollections: FeaturedCollection[];
};

/** `pages` row as returned by `GET /content/pages` and `/:slug`. */
export type StaticPage = {
  slug: string;
  title: L10n;
  body: L10n;
};

export const TRUST_BADGE_KEYS = ["shipping", "payment", "returns", "support"] as const;
export type TrustBadgeKey = (typeof TRUST_BADGE_KEYS)[number];
export type TrustBadges = Record<TrustBadgeKey, L10n>;

export const PAYMENT_METHOD_IDS = ["cod", "instapay", "vodafone-cash"] as const;
export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

export type PaymentMethod = {
  id: PaymentMethodId;
  name: L10n;
  isEnabled: boolean;
  instructions?: L10n;
  accountValue?: string;
};

export const SOCIAL_PLATFORMS = ["instagram", "tiktok", "facebook"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type SocialLink = { platform: SocialPlatform; url: string };

export type ContactSettings = {
  phone: string;
  email?: string;
  whatsapp?: string;
};

export type ShippingSettings = {
  defaultFee: number;
  /** Express delivery fee; falls back to `defaultFee` when unset. */
  expressFee?: number;
  freeAbove?: number;
};

/**
 * The store settings singleton as the storefront sees it
 * (`GET /settings/public`). `store_name` and `currency` are columns because
 * the frontend contract needs them on every page (D-076).
 */
export type StoreSettings = {
  storeName: string;
  currency: string;
  shipping: ShippingSettings;
  paymentMethods: PaymentMethod[];
  trustBadges: TrustBadges;
  social: SocialLink[];
  contact: ContactSettings;
};

/** Admin variant: same shape plus the SEO overrides the storefront never sees. */
export type AdminStoreSettings = StoreSettings & { seo?: Seo | null };

/** Free-form jsonb payload for keys the backend does not model (e.g. `banner:1`). */
export type ContentBlockData = Record<string, unknown>;
