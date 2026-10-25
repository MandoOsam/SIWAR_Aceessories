import { z } from "zod";

import {
  PAYMENT_METHOD_IDS,
  SOCIAL_PLATFORMS,
  type ContentBlockData,
} from "@/types/content.js";

/** Block keys the home endpoint composes (`GET /content/home`). */
export const HERO_BLOCK_KEY = "hero";
export const STORY_BLOCK_KEY = "story";
export const FEATURED_BLOCK_PREFIX = "featured:";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const BLOCK_KEY_PATTERN = /^[a-z0-9]+(?:[-:][a-z0-9]+)*$/;
const FEATURED_KEY_PATTERN = /^featured:[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Storefront paths and Cloudinary URLs are both allowed here. */
const assetPath = z.string().trim().min(1).max(2048);

export const l10nField = (max: number) =>
  z.object({
    ar: z.string().trim().min(1).max(max),
    en: z.string().trim().min(1).max(max),
  });

export const ctaSchema = z.object({
  label: l10nField(120),
  href: assetPath,
});

export const heroContentSchema = z.object({
  headline: l10nField(200),
  headlineAccent: l10nField(200),
  subline: l10nField(1000),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  posterUrl: assetPath.optional(),
});

export const storyContentSchema = z.object({
  title: l10nField(200),
  body: l10nField(3000),
  imageUrl: assetPath,
  ctaLabel: l10nField(120),
  ctaHref: assetPath,
});

export const featuredCollectionSchema = z.object({
  title: l10nField(200),
  subtitle: l10nField(300),
  imageUrl: assetPath,
  href: assetPath,
});

const genericBlockSchema = z.record(z.string(), z.unknown());

/**
 * Resolves the write/read schema for a block key. Known keys are strictly
 * typed; anything else (e.g. `banner:1`) must be a JSON object.
 */
export function blockDataSchema(key: string): z.ZodType<ContentBlockData> {
  if (key === HERO_BLOCK_KEY) return heroContentSchema;
  if (key === STORY_BLOCK_KEY) return storyContentSchema;
  if (key.startsWith(FEATURED_BLOCK_PREFIX)) return featuredCollectionSchema;
  return genericBlockSchema;
}

/** The `<id>` of `featured:<id>`, or null when the key is not a featured block. */
export function featuredIdFromKey(key: string): string | null {
  return FEATURED_KEY_PATTERN.test(key) ? key.slice(FEATURED_BLOCK_PREFIX.length) : null;
}

export const blockKeyParamSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(BLOCK_KEY_PATTERN, "Key must be lowercase words separated by dashes or colons"),
});

export const pageSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(SLUG_PATTERN, "Slug must be lowercase words separated by dashes"),
});

export const paymentMethodSchema = z.object({
  id: z.enum(PAYMENT_METHOD_IDS),
  name: l10nField(120),
  isEnabled: z.boolean(),
  instructions: l10nField(500).optional(),
  accountValue: z.string().trim().min(1).max(60).optional(),
});

export const shippingSettingsSchema = z.object({
  defaultFee: z.number().nonnegative().max(99_999),
  freeAbove: z.number().nonnegative().max(9_999_999).optional(),
});

export const trustBadgesSchema = z.object({
  shipping: l10nField(120),
  payment: l10nField(120),
  returns: l10nField(120),
  support: l10nField(120),
});

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z.url().max(2048),
});

export const contactSettingsSchema = z.object({
  phone: z.string().trim().min(5).max(30),
  email: z.email().max(200).optional(),
  whatsapp: z.string().trim().min(5).max(2048).optional(),
});

export const seoSchema = z
  .object({
    title: l10nField(200).optional(),
    description: l10nField(500).optional(),
  })
  .nullable();

export type BlockKeyParams = z.infer<typeof blockKeyParamSchema>;
export type PageSlugParams = z.infer<typeof pageSlugParamSchema>;
export type SeoInput = z.infer<typeof seoSchema>;
