import { z } from "zod";

import { PRODUCT_COLORS } from "./repository.js";
import type { ProductSort } from "./types.js";

export const PRODUCT_SORTS = [
  "newest",
  "best-selling",
  "price-asc",
  "price-desc",
  "rating",
] as const satisfies readonly ProductSort[];

/**
 * Query strings arrive as text, so booleans accept "true"/"false" only.
 * `z.coerce.boolean()` would turn the string "false" into `true`.
 */
const booleanQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true");

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(160, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by dashes"),
});

export const listProductsQuerySchema = z
  .object({
    category: z.string().trim().min(1).max(120).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    /** Accepted for contract compatibility; reviews (and therefore ratings) arrive in B6. */
    rating: z.coerce.number().min(0).max(5).optional(),
    inStock: booleanQuery.optional(),
    color: z.enum(PRODUCT_COLORS).optional(),
    size: z.string().trim().min(1).max(20).optional(),
    discount: booleanQuery.optional(),
    isNew: booleanQuery.optional(),
    sort: z.enum(PRODUCT_SORTS).default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(120).optional(),
  })
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    { message: "minPrice must be less than or equal to maxPrice", path: ["minPrice"] },
  );

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type SlugParams = z.infer<typeof slugParamSchema>;
