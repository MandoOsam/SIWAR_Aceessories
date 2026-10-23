import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { adminAuthRateLimiter } from "@/middlewares/rateLimit.js";
import { validateBody } from "@/middlewares/validate.js";
import * as controller from "./controller.js";
import { loginSchema } from "./schema.js";

/**
 * Staff endpoints (02-architecture §7). They live under `/admin/auth/*` and
 * use their own cookie (`siwar_admin_sid`), so a customer session can never
 * open an admin route.
 */
export const adminAuthRouter = Router();

adminAuthRouter.post(
  "/admin/auth/login",
  adminAuthRateLimiter,
  csrfProtection,
  validateBody(loginSchema),
  controller.adminLogin,
);

adminAuthRouter.post(
  "/admin/auth/logout",
  csrfProtection,
  authGuard({ kind: "admin", optional: true }),
  controller.adminLogout,
);

adminAuthRouter.get("/admin/auth/me", authGuard({ kind: "admin" }), controller.adminMe);
