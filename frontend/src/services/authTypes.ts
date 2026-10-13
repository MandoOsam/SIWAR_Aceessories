/**
 * Auth and account contract types (02-architecture.md §7).
 *
 * Split out of `types.ts` to keep that barrel within the 300-line limit (D-048); `types.ts`
 * re-exports everything here, so imports keep using `@/services/types`.
 */

import type { L10n } from "./types";

/**
 * Signed-in customer (`GET /auth/me`, `PATCH /account/profile`).
 *
 * The storefront only ever sees `role: "customer"`; staff roles exist in the admin app
 * (02-architecture.md §5). The session itself is an httpOnly cookie, never a client value.
 */
export type AuthUser = {
  id: string;
  name: string;
  /** Optional bilingual name shown on the storefront (`PATCH /account/profile`). */
  displayName?: L10n;
  email: string;
  phone?: string;
  role: "customer";
  createdAt: string;
};

/** Body of `POST /auth/login`. */
export type LoginInput = {
  email: string;
  password: string;
};

/** Body of `POST /auth/register`. */
export type RegisterInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

/** Body of `POST /auth/forgot-password`. */
export type ForgotPasswordInput = {
  email: string;
};

/** Body of `POST /auth/reset-password`. */
export type ResetPasswordInput = {
  token: string;
  password: string;
};

/** Body of `PATCH /account/profile`. */
export type UpdateProfileInput = {
  name: string;
  phone?: string;
  /** Omitted when the customer leaves the display name blank. */
  displayName?: L10n;
};

/** Body of `POST /account/change-password`. */
export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const PASSWORD_STRENGTHS = ["weak", "medium", "strong"] as const;

export type PasswordStrength = (typeof PASSWORD_STRENGTHS)[number];
