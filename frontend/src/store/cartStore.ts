/**
 * Cart client state.
 *
 * The cart lives on the client until the customer checks out; the server recomputes every total
 * when the order is created (02-architecture.md §10 forbids trusting client-side prices).
 * Storing the chosen items in `localStorage` is explicitly allowed (03-code-standards.md §5).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ROUTES, STORAGE_KEYS } from "@/config/app";

export type CartVariant = {
  color?: string;
  size?: string;
};

/** Stable identity of a line: same product + same variant. */
function lineKey(productId: string, variant: CartVariant): string {
  const color = variant.color ?? "";
  const size = variant.size ?? "";
  return `${productId}::${color}::${size}`;
}

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  /** Snapshot for instant rendering; the server re-reads the real values at checkout. */
  name: { ar: string; en: string };
  imageUrl: string;
  price: number;
  qty: number;
  variant: CartVariant;
  maxQty: number;
};

export type Coupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
  /** Frees the shipping fee (coupon `FREESHIP`); shipping is only charged at checkout. */
  freeShipping?: boolean;
};

type CartState = {
  items: CartItem[];
  /** Lines set aside with "Save for later"; kept in the same store so one persist key covers both. */
  saved: CartItem[];
  coupon: Coupon | null;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      saved: [],
      coupon: null,

      addItem: (item) =>
        set((state) => {
          const key = lineKey(item.productId, item.variant);
          const existing = state.items.find((line) => line.key === key);
          if (existing === undefined) {
            return { items: [...state.items, { ...item, key }] };
          }
          return {
            items: state.items.map((line) =>
              line.key === key
                ? { ...line, qty: Math.min(line.qty + item.qty, line.maxQty) }
                : line,
            ),
          };
        }),

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((line) => line.key !== key) })),

      setQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.key === key ? { ...line, qty: Math.min(Math.max(qty, 1), line.maxQty) } : line,
          ),
        })),

      clear: () => set({ items: [], coupon: null }),

      saveForLater: (key) =>
        set((state) => {
          const item = state.items.find((line) => line.key === key);
          if (item === undefined) {
            return {};
          }
          return {
            items: state.items.filter((line) => line.key !== key),
            saved: state.saved.some((line) => line.key === key)
              ? state.saved
              : [...state.saved, item],
          };
        }),

      moveToCart: (key) =>
        set((state) => {
          const item = state.saved.find((line) => line.key === key);
          if (item === undefined) {
            return {};
          }
          const existing = state.items.find((line) => line.key === key);
          return {
            saved: state.saved.filter((line) => line.key !== key),
            items:
              existing === undefined
                ? [...state.items, item]
                : state.items.map((line) =>
                    line.key === key
                      ? { ...line, qty: Math.min(line.qty + item.qty, line.maxQty) }
                      : line,
                  ),
          };
        }),

      removeSaved: (key) =>
        set((state) => ({ saved: state.saved.filter((line) => line.key !== key) })),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: STORAGE_KEYS.cart,
      partialize: (state) => ({
        items: state.items,
        saved: state.saved,
        coupon: state.coupon,
      }),
    },
  ),
);

/** Total number of units, used for the navbar badge. */
export function selectCartCount(state: CartState): number {
  return state.items.reduce((total, line) => total + line.qty, 0);
}

/** Merchandise total only. Shipping, discount and grand total are computed server-side. */
export function selectSubtotal(state: CartState): number {
  return state.items.reduce((total, line) => total + line.price * line.qty, 0);
}

/** Number of distinct "save for later" lines, used to label the section. */
export function selectSavedCount(state: CartState): number {
  return state.saved.length;
}

/** Discount the applied coupon yields for the current subtotal (capped, never below zero). */
export function selectDiscount(state: CartState): number {
  const { coupon } = state;
  if (coupon === null) {
    return 0;
  }
  const subtotal = selectSubtotal(state);
  const raw = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  const capped = coupon.maxDiscount === undefined ? raw : Math.min(raw, coupon.maxDiscount);
  return Math.round(Math.min(capped, subtotal) * 100) / 100;
}

/** Grand total the customer sees before shipping; the server recomputes it at checkout. */
export function selectTotal(state: CartState): number {
  return Math.round((selectSubtotal(state) - selectDiscount(state)) * 100) / 100;
}

export const CART_PAGE_ROUTE = ROUTES.cart;
