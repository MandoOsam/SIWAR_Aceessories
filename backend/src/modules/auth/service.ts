import { SESSION_TTL_MS } from "@/config/session.js";
import { STAFF_ROLES } from "@/config/permissions.js";
import type { User } from "@/db/schema/users.js";
import { AppError } from "@/middlewares/errorHandler.js";
import { hashPassword, verifyPassword } from "@/lib/password.js";
import type { AuthUser, LoginInput, RegisterInput } from "./types.js";
import type { SessionKind } from "@/db/schema/sessions.js";
import * as repo from "./repository.js";

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    displayName: user.displayName,
    phone: user.phone,
    role: user.role,
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) {
    throw new AppError("CONFLICT", 409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const [created] = await repo.insertUser({
    email: input.email,
    name: input.name,
    phone: input.phone,
    passwordHash,
    role: "customer",
  });

  if (!created) {
    throw new AppError("INTERNAL_ERROR", 500, "Could not create account");
  }
  return toAuthUser(created);
}

export async function verifyCredentials(input: LoginInput): Promise<User | null> {
  const user = await repo.findUserByEmail(input.email);
  // Always run a verify to keep timing consistent whether or not the email exists.
  const ok = user ? await verifyPassword(user.passwordHash, input.password) : false;
  if (!user || !ok || !user.isActive) return null;
  await repo.touchLastLogin(user.id);
  return user;
}

/**
 * Staff login. Same rules as `verifyCredentials`, plus the account must hold a
 * staff role — a customer account can never open an admin session. The error
 * is intentionally the same as a wrong password so the endpoint does not leak
 * which emails exist or what role they have.
 */
export async function verifyAdminCredentials(input: LoginInput): Promise<User | null> {
  const user = await repo.findUserByEmail(input.email);
  const ok = user ? await verifyPassword(user.passwordHash, input.password) : false;
  if (!user || !ok || !user.isActive) return null;
  if (!STAFF_ROLES.includes(user.role)) return null;
  await repo.touchLastLogin(user.id);
  return user;
}

export async function createSession(
  user: Pick<User, "id">,
  kind: SessionKind,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<string> {
  const [session] = await repo.insertSession({
    userId: user.id,
    kind,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
  });
  if (!session) {
    throw new AppError("INTERNAL_ERROR", 500, "Could not create session");
  }
  return session.id;
}

/**
 * Resolves a session cookie to its user.
 *
 * The session `kind` must match the cookie the request came in on, so a
 * customer session id pasted into the admin cookie is rejected (02-architecture
 * §5: "a customer session never works on admin routes"). An admin session also
 * stops working the moment the account loses its staff role.
 */
export async function validateSession(
  sessionId: string,
  kind: SessionKind,
): Promise<AuthUser | null> {
  const found = await repo.findValidSession(sessionId);
  if (!found || found.kind !== kind || !found.user.isActive) return null;
  if (kind === "admin" && !STAFF_ROLES.includes(found.user.role)) return null;
  return toAuthUser(found.user);
}

export async function logout(sessionId: string): Promise<void> {
  await repo.deleteSession(sessionId);
}

export async function updateProfile(
  userId: string,
  input: Partial<Pick<AuthUser, "name" | "phone" | "displayName">> & Record<string, unknown>,
): Promise<AuthUser> {
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.displayName !== undefined) updates.displayName = input.displayName;
  const [updated] = await repo.updateUser(userId, updates);
  if (!updated) throw new AppError("INTERNAL_ERROR", 500, "Could not update profile");
  return toAuthUser(updated);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  keepSessionId?: string,
): Promise<void> {
  const user = await repo.findUserById(userId);
  if (!user) throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  const ok = await verifyPassword(user.passwordHash, currentPassword);
  if (!ok) throw new AppError("UNAUTHORIZED", 401, "Current password is incorrect");
  const passwordHash = await hashPassword(newPassword);
  await repo.updateUser(userId, { passwordHash });
  await repo.deleteOtherSessions(userId, keepSessionId ?? "");
}
