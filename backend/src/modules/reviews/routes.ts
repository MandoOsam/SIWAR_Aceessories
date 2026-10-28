import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { reviewRateLimiter } from "@/middlewares/rateLimit.js";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./controller.js";
import {
  createReviewSchema,
  listReviewsQuerySchema,
  paginationQuerySchema,
  productIdParamSchema,
} from "./schema.js";

/**
 * Public reviews (02-architecture section 7). Reads are anonymous; submission
 * is open to guests and signed-in customers, goes through CSRF protection and
 * a rate limiter, and is stored as `pending` for moderation.
 */
export const reviewsRouter = Router();

reviewsRouter.get("/reviews", validateQuery(listReviewsQuerySchema), controller.listReviews);

reviewsRouter.get(
  "/products/:id/reviews",
  validateParams(productIdParamSchema),
  validateQuery(paginationQuerySchema),
  controller.listProductReviews,
);

reviewsRouter.post(
  "/products/:id/reviews",
  reviewRateLimiter,
  csrfProtection,
  authGuard({ optional: true }),
  validateParams(productIdParamSchema),
  validateBody(createReviewSchema),
  controller.createReview,
);
