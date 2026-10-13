/**
 * Account service — profile edits and password change (`02-architecture.md` §7).
 *
 * Split out of `authService` to keep both files within the 300-line limit (D-048). Mock mode
 * mirrors a saved profile into `localStorage` (profiles only, no password) and reads it ahead of the
 * seed, so an edited demo account survives a refresh; password changes stay in memory (D-046).
 */

import { IS_MOCK_MODE } from "@/config/env";

import { AuthError } from "./authService";
import { patch, postVoid } from "./http";
import {
  findProfileById,
  findSeeded,
  readProfiles,
  readSessionId,
  sessionPasswords,
  writeProfiles,
} from "./mockAuthStore";
import { simulateLatency } from "./mockAdapter";
import type { AuthUser, ChangePasswordInput, UpdateProfileInput } from "./types";

/** `PATCH /account/profile` — saves the editable profile fields. */
export async function updateProfile(
  input: UpdateProfileInput,
  signal?: AbortSignal,
): Promise<AuthUser> {
  if (!IS_MOCK_MODE) {
    return patch<AuthUser>("/account/profile", input, signal);
  }
  await simulateLatency(signal);

  const id = readSessionId();
  const current = id === null ? undefined : findProfileById(id);
  if (current === undefined) {
    throw new AuthError("unknown");
  }

  const phone = input.phone?.trim();
  const updated: AuthUser = {
    ...current,
    name: input.name.trim(),
    phone: phone === undefined || phone === "" ? undefined : phone,
    displayName: input.displayName,
  };

  const others = readProfiles().filter((profile) => profile.id !== updated.id);
  writeProfiles([updated, ...others]);
  return updated;
}

/** `POST /account/change-password` — verifies the current password, then replaces it. */
export async function changePassword(
  input: ChangePasswordInput,
  signal?: AbortSignal,
): Promise<void> {
  if (!IS_MOCK_MODE) {
    await postVoid("/account/change-password", input, signal);
    return;
  }
  await simulateLatency(signal);

  const id = readSessionId();
  const current = id === null ? undefined : findProfileById(id);
  if (current === undefined) {
    throw new AuthError("unknown");
  }

  const email = current.email.trim().toLowerCase();
  const expected = sessionPasswords.get(email) ?? findSeeded(email)?.password;
  if (expected === undefined || expected !== input.currentPassword) {
    throw new AuthError("invalid-current-password");
  }

  // In-memory only: the mock never persists a password (D-046); real mode rotates it server-side.
  sessionPasswords.set(email, input.newPassword);
}
