import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { authRateLimiter } from "@/middlewares/rateLimit.js";
import { validateBody } from "@/middlewares/validate.js";
import * as controller from "./controller.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "./schema.js";

export const authRouter = Router();

// Token is needed before any mutation, so it is a GET (not CSRF-protected).
authRouter.get("/auth/csrf", controller.issueCsrf);

authRouter.post(
  "/auth/register",
  authRateLimiter,
  csrfProtection,
  validateBody(registerSchema),
  controller.register,
);

authRouter.post(
  "/auth/login",
  authRateLimiter,
  csrfProtection,
  validateBody(loginSchema),
  controller.login,
);

authRouter.post("/auth/logout", csrfProtection, authGuard({ optional: true }), controller.logout);

authRouter.get("/auth/me", authGuard(), controller.me);
authRouter.get("/account/profile", authGuard({ kind: "customer" }), controller.getProfile);
authRouter.patch(
  "/account/profile",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateBody(updateProfileSchema),
  controller.updateProfile,
);
authRouter.post(
  "/account/change-password",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateBody(changePasswordSchema),
  controller.changePassword,
);
