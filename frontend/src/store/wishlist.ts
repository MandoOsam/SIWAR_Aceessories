/**
 * Wishlist client state.
 *
 * A list of product ids the customer saved, persisted to `localStorage` — an allowed client-storage
 * value (03-code-standards.md §5). The server owns the authoritative wishlist once the backend
 * exists; this mock store keeps the heart, the navbar and `/account/wishlist` in sync meanwhile.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/config/app";

type WishlistState = {
  items: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  clear: () => void;
  isWishlisted: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (productId) =>
        set((state) =>
          state.items.includes(productId) ? state : { items: [...state.items, productId] },
        ),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((id) => id !== productId) })),

      toggle: (productId) =>
        set((state) =>
          state.items.includes(productId)
            ? { items: state.items.filter((id) => id !== productId) }
            : { items: [...state.items, productId] },
        ),

      clear: () => set({ items: [] }),

      isWishlisted: (productId) => get().items.includes(productId),
    }),
    { name: STORAGE_KEYS.wishlist },
  ),
);

/** Number of saved products, used for labels. */
export function selectWishlistCount(state: WishlistState): number {
  return state.items.length;
}
