import { randomBytes, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/config/session.js";
import { env } from "@/config/env.js";
import { AppError } from "@/middlewares/errorHandler.js";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const ALLOWED_ORIGINS = new Set([env.FRONTEND_ORIGIN, env.ADMIN_ORIGIN]);

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Double-submit CSRF (02-architecture §5): mutating requests must (1) come from
 * an allowed Origin and (2) echo the value of the non-httpOnly `siwar_csrf`
 * cookie in the `X-CSRF-Token` header. `GET /auth/csrf` issues the cookie.
 */
export const csrfProtection: RequestHandler = (req, _res, next) => {
  if (!MUTATING.has(req.method)) return next();

  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return next(new AppError("FORBIDDEN", 403, "Request origin not allowed"));
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];
  const headerValue = Array.isArray(headerToken) ? headerToken[0] : headerToken;

  if (!cookieToken || !headerValue || !safeEqual(cookieToken, headerValue)) {
    return next(new AppError("FORBIDDEN", 403, "Invalid CSRF token"));
  }

  return next();
};
