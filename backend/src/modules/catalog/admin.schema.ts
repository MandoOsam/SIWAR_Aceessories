import { z } from "zod";

import { PRODUCT_STATUSES } from "@/db/schema/products.js";
import { booleanQuery } from "./schema.js";
import { PRODUCT_COLORS } from "./repository.js";

/**
 * Admin catalogue input (02-architecture section 6). Prices are plain numbers
 * in EGP; the service converts them to `numeric(10,2)` strings for the column.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const l10n = (max: number) =>
  z.object({
    ar: z.string().trim().min(1).max(max),
    en: z.string().trim().min(1).max(max),
  });

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(SLUG_PATTERN, "Slug must be lowercase words separated by dashes");

const seoSchema = z
  .object({
    title: l10n(200).optional(),
    description: l10n(500).optional(),
  })
  .nullable();

const money = z.number().nonnegative().max(9_999_999.99);

const imageSchema = z.object({
  url: z.url().max(2048),
  alt: l10n(200).optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(99).optional(),
});

export const idParamSchema = z.object({
  id: z.uuid("Invalid id"),
});

export const adminCategoryListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  isActive: booleanQuery.optional(),
});

export const createCategorySchema = z.object({
  slug: slugSchema.optional(),
  name: l10n(200),
  description: l10n(5000).optional(),
  imageUrl: z.url().max(2048).nullable().optional(),
  parentId: z.uuid().nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
  seo: seoSchema.optional(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const adminProductListQuerySchema = z.object({
  status: z.enum(PRODUCT_STATUSES).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "oldest", "price-asc", "price-desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createProductSchema = z.object({
  slug: slugSchema.optional(),
  sku: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/, "SKU may contain letters, digits, dot, dash and underscore")
    .optional(),
  name: l10n(200),
  description: l10n(5000),
  categoryId: z.uuid(),
  price: money,
  oldPrice: money.nullable().optional(),
  discountPercent: z.number().int().min(0).max(100).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000).optional(),
  lowStockThreshold: z.number().int().min(0).max(10_000).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  colors: z.array(z.enum(PRODUCT_COLORS)).max(8).optional(),
  sizes: z.array(z.string().trim().min(1).max(20)).max(20).optional(),
  material: z.string().trim().min(1).max(60).optional(),
  plating: l10n(120).nullable().optional(),
  waterResistant: z.boolean().optional(),
  hypoallergenic: z.boolean().optional(),
  seo: seoSchema.optional(),
  images: z.array(imageSchema).max(10).optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type AdminCategoryListQuery = z.infer<typeof adminCategoryListQuerySchema>;
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type IdParams = z.infer<typeof idParamSchema>;
