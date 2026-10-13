/**
 * Auth service — register, login, logout, session read and password recovery.
 *
 * One function per endpoint in `02-architecture.md` §7. The real API keeps the session in an
 * httpOnly cookie and answers `GET /auth/me` with the signed-in user, so nothing sensitive is ever
 * held client-side. Mock mode mirrors that with `localStorage` (see `mockAuthStore`): passwords live
 * in the bundle (demo account) or in memory for the session, never on disk (D-046).
 */

import { IS_MOCK_MODE } from "@/config/env";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/data/auth";

import { ApiError, getOne, post, postVoid } from "./http";
import {
  findProfile,
  findProfileById,
  findSeeded,
  readProfiles,
  readSessionId,
  sessionPasswords,
  writeProfiles,
  writeSessionId,
} from "./mockAuthStore";
import { simulateLatency } from "./mockAdapter";
import type {
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./types";

/** Reasons the auth calls can fail; the pages map each to a translated message. */
export type AuthErrorCode =
  "invalid-credentials" | "email-taken" | "invalid-token" | "invalid-current-password" | "unknown";

/** Typed failure thrown by the auth service. */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
    this.code = code;
  }
}

/**
 * Mock-only demo credentials for the login page hint; `null` against the real API so no password is
 * ever shipped once `VITE_API_URL` is set.
 */
export function getDemoCredentials(): { email: string; password: string } | null {
  if (!IS_MOCK_MODE) {
    return null;
  }
  return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
}

/** `GET /auth/me` — resolves `null` when there is no session (the real API answers 401). */
export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser | null> {
  if (!IS_MOCK_MODE) {
    try {
      return await getOne<AuthUser>("/auth/me", signal);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }
      throw error;
    }
  }
  await simulateLatency(signal);
  const id = readSessionId();
  if (id === null) {
    return null;
  }
  return findProfileById(id) ?? null;
}

/** `POST /auth/login`. */
export async function login(input: LoginInput, signal?: AbortSignal): Promise<AuthUser> {
  if (!IS_MOCK_MODE) {
    return post<AuthUser>("/auth/login", input, signal);
  }
  await simulateLatency(signal);

  const email = input.email.trim().toLowerCase();
  const profile = findProfile(email);
  const expected = sessionPasswords.get(email) ?? findSeeded(email)?.password;

  if (expected === undefined || expected !== input.password || profile === undefined) {
    throw new AuthError("invalid-credentials");
  }

  writeSessionId(profile.id);
  return profile;
}

/** `POST /auth/register` — creates the account and signs it in. */
export async function register(input: RegisterInput, signal?: AbortSignal): Promise<AuthUser> {
  if (!IS_MOCK_MODE) {
    return post<AuthUser>("/auth/register", input, signal);
  }
  await simulateLatency(signal);

  const email = input.email.trim().toLowerCase();
  if (findProfile(email) !== undefined) {
    throw new AuthError("email-taken");
  }

  const profile: AuthUser = {
    id: `mock-user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    email,
    phone: input.phone?.trim() === "" ? undefined : input.phone?.trim(),
    role: "customer",
    createdAt: new Date().toISOString(),
  };
  writeProfiles([profile, ...readProfiles()]);
  sessionPasswords.set(email, input.password);
  writeSessionId(profile.id);
  return profile;
}

/** `POST /auth/logout` — clears the session; safe to call when already signed out. */
export async function logout(signal?: AbortSignal): Promise<void> {
  if (!IS_MOCK_MODE) {
    await postVoid("/auth/logout", {}, signal);
    return;
  }
  await simulateLatency(signal);
  writeSessionId(null);
}

/** `POST /auth/forgot-password` — always resolves, so the endpoint cannot enumerate emails. */
export async function forgotPassword(
  input: ForgotPasswordInput,
  signal?: AbortSignal,
): Promise<void> {
  if (!IS_MOCK_MODE) {
    await postVoid("/auth/forgot-password", input, signal);
    return;
  }
  await simulateLatency(signal);
  void input;
}

/** `POST /auth/reset-password` — the mock accepts any non-empty token. */
export async function resetPassword(
  input: ResetPasswordInput,
  signal?: AbortSignal,
): Promise<void> {
  if (!IS_MOCK_MODE) {
    await postVoid("/auth/reset-password", input, signal);
    return;
  }
  await simulateLatency(signal);
  if (input.token.trim() === "") {
    throw new AuthError("invalid-token");
  }
}
