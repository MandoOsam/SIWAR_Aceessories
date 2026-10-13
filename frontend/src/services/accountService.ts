/**
 * Account service — profile, addresses and notifications (`02-architecture.md` §7).
 *
 * Split out of `authService` to keep both files within the 300-line limit (D-048). Mock mode
 * mirrors a saved profile into `localStorage` (profiles only, no password) and reads it ahead of the
 * seed, so an edited demo account survives a refresh; password changes stay in memory (D-046).
 * Addresses and orders are re-exported from the mock stores that own them (`checkoutService`,
 * this file) so the account pages have a single import surface.
 */

import { STORAGE_KEYS } from "@/config/app";
import { IS_MOCK_MODE } from "@/config/env";
import { seedNotifications } from "@/data/notifications";

import { AuthError } from "./authService";
import { deleteVoid, getList, patch, post, postVoid } from "./http";
import {
  findProfileById,
  findSeeded,
  readProfiles,
  readSessionId,
  sessionPasswords,
  writeProfiles,
} from "./mockAuthStore";
import { simulateLatency } from "./mockAdapter";
import type {
  Address,
  AddressInput,
  AuthUser,
  ChangePasswordInput,
  Notification,
  UpdateProfileInput,
} from "./types";

export {
  cancelOrder,
  getOrderById as getMyOrder,
  listOrders as getMyOrders,
  requestReturn,
} from "./checkoutService";

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

/* ------------------------------- Addresses ------------------------------- */

/** In-memory + `localStorage` mock address book (mirrors the `checkoutService` order store). */
let memoryAddresses: Address[] | null = null;

function readAddresses(): Address[] {
  if (memoryAddresses !== null) {
    return memoryAddresses;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mockAddresses);
    memoryAddresses = raw === null ? [] : (JSON.parse(raw) as Address[]);
  } catch {
    memoryAddresses = [];
  }
  return memoryAddresses;
}

function writeAddresses(list: Address[]): void {
  memoryAddresses = list;
  try {
    localStorage.setItem(STORAGE_KEYS.mockAddresses, JSON.stringify(list));
  } catch {
    // Storage can be blocked (private mode); the in-memory copy keeps the session working.
  }
}

function makeAddressId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `addr_${crypto.randomUUID()}`;
  }
  return `addr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Trims the payload and turns empty optional fields into `undefined`. */
function normalizeAddress(input: AddressInput): Omit<Address, "id" | "isDefault"> {
  const building = input.building?.trim();
  const apartment = input.apartment?.trim();
  return {
    governorate: input.governorate,
    city: input.city.trim(),
    street: input.street.trim(),
    building: building === undefined || building === "" ? undefined : building,
    apartment: apartment === undefined || apartment === "" ? undefined : apartment,
    phone: input.phone.trim(),
  };
}

/** `GET /account/addresses` — the customer's saved delivery addresses. */
export async function getMyAddresses(signal?: AbortSignal): Promise<Address[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<Address>("/account/addresses", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return readAddresses();
}

/** `POST /account/addresses` — the first saved address becomes the default. */
export async function createAddress(input: AddressInput, signal?: AbortSignal): Promise<Address> {
  if (!IS_MOCK_MODE) {
    return post<Address>("/account/addresses", input, signal);
  }
  await simulateLatency(signal);
  const existing = readAddresses();
  const address: Address = {
    id: makeAddressId(),
    ...normalizeAddress(input),
    isDefault: existing.length === 0,
  };
  writeAddresses([...existing, address]);
  return address;
}

/** `PATCH /account/addresses/:id` — edits an address, keeping its default flag. */
export async function updateAddress(
  id: string,
  input: AddressInput,
  signal?: AbortSignal,
): Promise<Address> {
  if (!IS_MOCK_MODE) {
    return patch<Address>(`/account/addresses/${id}`, input, signal);
  }
  await simulateLatency(signal);
  const existing = readAddresses();
  const current = existing.find((address) => address.id === id);
  if (current === undefined) {
    throw new AuthError("unknown");
  }
  const updated: Address = { ...current, ...normalizeAddress(input) };
  writeAddresses(existing.map((address) => (address.id === id ? updated : address)));
  return updated;
}

/** `DELETE /account/addresses/:id` — promotes the first remaining address when the default goes. */
export async function deleteAddress(id: string, signal?: AbortSignal): Promise<void> {
  if (!IS_MOCK_MODE) {
    await deleteVoid(`/account/addresses/${id}`, signal);
    return;
  }
  await simulateLatency(signal);
  const existing = readAddresses();
  const removed = existing.find((address) => address.id === id);
  const next = existing.filter((address) => address.id !== id);
  const [first] = next;
  if (removed?.isDefault === true && first !== undefined) {
    next[0] = { ...first, isDefault: true };
  }
  writeAddresses(next);
}

/** `PATCH /account/addresses/:id/default` — makes one address the default. */
export async function setDefaultAddress(id: string, signal?: AbortSignal): Promise<void> {
  if (!IS_MOCK_MODE) {
    await patch<Address>(`/account/addresses/${id}/default`, {}, signal);
    return;
  }
  await simulateLatency(signal);
  writeAddresses(readAddresses().map((address) => ({ ...address, isDefault: address.id === id })));
}

/** `GET /account/notifications` — mock mode returns the seed until the backend exists. */
export async function getMyNotifications(signal?: AbortSignal): Promise<Notification[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<Notification>("/account/notifications", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return seedNotifications;
}
