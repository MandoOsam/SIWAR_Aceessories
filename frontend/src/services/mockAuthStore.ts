/**
 * Mock-only persistence for the auth and account services (D-046).
 *
 * Mirrors the "httpOnly cookie + server profile" contract with `localStorage`: profiles and the
 * session id are stored, passwords live in the bundle (demo account) or in memory for the session
 * and are never written to disk. Shared by `authService` and `accountService` so both read the same
 * saved profile ahead of the seed (D-047).
 */

import { STORAGE_KEYS } from "@/config/app";
import { seedAccounts, type MockAccount } from "@/data/auth";

import type { AuthUser } from "./types";

/** Mock-only: runtime-created account passwords, kept for the session and never persisted. */
export const sessionPasswords = new Map<string, string>();

let memoryProfiles: AuthUser[] | null = null;

/** Drops the password from a mock account so only the public shape is stored or returned. */
export function toProfile(account: MockAccount): AuthUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
    createdAt: account.createdAt,
  };
}

export function readProfiles(): AuthUser[] {
  if (memoryProfiles !== null) {
    return memoryProfiles;
  }
  let parsed: AuthUser[] = [];
  try {
    const raw =
      typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEYS.mockUsers);
    const value: unknown = raw === null ? null : JSON.parse(raw);
    if (Array.isArray(value)) {
      parsed = value as AuthUser[];
    }
  } catch {
    parsed = [];
  }
  memoryProfiles = parsed;
  return memoryProfiles;
}

export function writeProfiles(profiles: AuthUser[]): void {
  memoryProfiles = profiles;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.mockUsers, JSON.stringify(profiles));
    }
  } catch {
    // Storage can be full or unavailable; the in-memory copy still works for this session.
  }
}

export function readSessionId(): string | null {
  try {
    return typeof localStorage === "undefined"
      ? null
      : localStorage.getItem(STORAGE_KEYS.mockSession);
  } catch {
    return null;
  }
}

export function writeSessionId(id: string | null): void {
  try {
    if (typeof localStorage === "undefined") {
      return;
    }
    if (id === null) {
      localStorage.removeItem(STORAGE_KEYS.mockSession);
    } else {
      localStorage.setItem(STORAGE_KEYS.mockSession, id);
    }
  } catch {
    // Ignore: absence of the flag just means the next boot is signed out.
  }
}

export function findSeeded(email: string): MockAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return seedAccounts.find((account) => account.email.toLowerCase() === normalized);
}

export function findProfile(email: string): AuthUser | undefined {
  const normalized = email.trim().toLowerCase();
  const stored = readProfiles().find((profile) => profile.email.toLowerCase() === normalized);
  if (stored !== undefined) {
    return stored;
  }
  const seeded = findSeeded(email);
  return seeded !== undefined ? toProfile(seeded) : undefined;
}

/** Resolves a profile by session id, preferring a saved edit over the seed (D-047). */
export function findProfileById(id: string): AuthUser | undefined {
  const stored = readProfiles().find((profile) => profile.id === id);
  if (stored !== undefined) {
    return stored;
  }
  const seeded = seedAccounts.find((account) => account.id === id);
  return seeded !== undefined ? toProfile(seeded) : undefined;
}
