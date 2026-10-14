/**
 * Mock order persistence shared by the checkout and account order calls.
 *
 * The order list is held in memory and mirrored to `localStorage` so a refresh does not lose it.
 * Split out of `checkoutService.ts` to keep that file within the 300-line limit (D-050); the real
 * API replaces this entirely in non-mock mode (02-architecture.md §7).
 */

import { STORAGE_KEYS } from "@/config/app";

import type { Order } from "./types";

const MOCK_ORDERS_KEY = STORAGE_KEYS.mockOrders;

/** First order number handed out; matches the `SW-10025`-style sample in the UI spec. */
const FIRST_ORDER_SEQUENCE = 10024;

let memoryOrders: Order[] | null = null;

/** Reads the order list once, then serves it from memory. Never throws. */
export function readOrders(): Order[] {
  if (memoryOrders !== null) {
    return memoryOrders;
  }
  let parsed: Order[] = [];
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(MOCK_ORDERS_KEY);
    const value: unknown = raw === null ? null : JSON.parse(raw);
    if (Array.isArray(value)) {
      parsed = value as Order[];
    }
  } catch {
    parsed = [];
  }
  memoryOrders = parsed;
  return memoryOrders;
}

export function writeOrders(orders: Order[]): void {
  memoryOrders = orders;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch {
    // Storage can be full or unavailable (private mode); the in-memory copy still works.
  }
}

/** Highest existing `SW-####` across persisted orders, so refreshes never reuse a number. */
export function lastOrderSequence(): number {
  return readOrders().reduce((max, order) => {
    const value = Number(order.number.replace(/^SW-/, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, FIRST_ORDER_SEQUENCE);
}
