import { env } from "@/config/env.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const SESSION_TTL_MS = THIRTY_DAYS_MS;

export const SESSION_COOKIE_NAME = "siwar_sid";
export const ADMIN_SESSION_COOKIE_NAME = "siwar_admin_sid";

export const CSRF_COOKIE_NAME = "siwar_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  domain: env.COOKIE_DOMAIN || undefined,
};
