import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { requirePermission } from "@/middlewares/requireRole.js";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./admin.controller.js";
import {
  adminListReviewsQuerySchema,
  moderateReviewSchema,
  reviewIdParamSchema,
} from "./schema.js";

/**
 * Admin review moderation (02-architecture section 7). Reads use
 * `reviews:read`, mutations use `reviews:write` and CSRF protection.
 */
const readAccess = [authGuard({ kind: "admin" }), requirePermission("reviews:read")];
const writeAccess = [
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("reviews:write"),
];

export const adminReviewsRouter = Router();

adminReviewsRouter.get(
  "/admin/reviews",
  ...readAccess,
  validateQuery(adminListReviewsQuerySchema),
  controller.listReviews,
);
adminReviewsRouter.patch(
  "/admin/reviews/:id",
  ...writeAccess,
  validateParams(reviewIdParamSchema),
  validateBody(moderateReviewSchema),
  controller.moderateReview,
);
adminReviewsRouter.delete(
  "/admin/reviews/:id",
  ...writeAccess,
  validateParams(reviewIdParamSchema),
  controller.deleteReview,
);
