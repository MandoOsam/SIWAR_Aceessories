import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedState {
  productIds: string[];
  addProduct: (productId: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addProduct: (productId: string) => {
        const { productIds } = get();
        // Remove if exists to move to front
        const filtered = productIds.filter((id) => id !== productId);
        const newIds = [productId, ...filtered].slice(0, 12);
        set({ productIds: newIds });
      },
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "siwar-recently-viewed",
    },
  ),
);

export default useRecentlyViewedStore;
