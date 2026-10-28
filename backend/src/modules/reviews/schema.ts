import { z } from "zod";

import { REVIEW_STATUSES } from "@/types/reviews.js";

const queryBoolean = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true");

export const reviewIdParamSchema = z.object({
  id: z.string().uuid("Review id must be a UUID"),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid("Product id must be a UUID"),
});

export const reviewTextSchema = z.object({
  ar: z.string().trim().min(10, "Arabic text must be at least 10 characters").max(1000),
  en: z.string().trim().min(10, "English text must be at least 10 characters").max(1000),
});

export const createReviewSchema = z.object({
  authorName: z.string().trim().min(2, "Name is too short").max(120, "Name is too long"),
  rating: z.number().int().min(1).max(5),
  text: reviewTextSchema,
  images: z.array(z.string().url("Image must be a URL")).max(5, "At most 5 images").optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listReviewsQuerySchema = paginationQuerySchema.extend({
  productId: z.string().uuid("productId must be a UUID").optional(),
  showOnHome: queryBoolean.optional(),
});

export const adminListReviewsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(REVIEW_STATUSES).optional(),
  productId: z.string().uuid("productId must be a UUID").optional(),
});

export const moderateReviewSchema = z
  .object({
    status: z.enum(["approved", "hidden"]).optional(),
    showOnHome: z.boolean().optional(),
  })
  .refine((body) => body.status !== undefined || body.showOnHome !== undefined, {
    message: "Provide status or showOnHome",
  });

export type CreateReviewBody = z.infer<typeof createReviewSchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export type AdminListReviewsQuery = z.infer<typeof adminListReviewsQuerySchema>;
export type ModerateReviewBody = z.infer<typeof moderateReviewSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
