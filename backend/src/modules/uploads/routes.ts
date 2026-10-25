import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { uploadRateLimiter } from "@/middlewares/rateLimit.js";
import { requirePermission } from "@/middlewares/requireRole.js";
import { validateBody } from "@/middlewares/validate.js";
import * as controller from "./controller.js";
import { signUploadSchema } from "./schema.js";

/**
 * Signed upload endpoint (02-architecture section 7). Staff only, CSRF-checked
 * and rate limited so a compromised session cannot burn the Cloudinary quota.
 * The role check follows the catalogue write permission until B7 adds the
 * dedicated media permissions.
 */
export const adminUploadsRouter = Router();

adminUploadsRouter.post(
  "/admin/uploads/sign",
  uploadRateLimiter,
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("products:write", "content:write"),
  validateBody(signUploadSchema),
  controller.sign,
);
