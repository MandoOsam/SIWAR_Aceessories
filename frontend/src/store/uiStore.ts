/**
 * UI state that is not server state: which overlay is open and how the navbar reacts to scroll.
 *
 * Kept in Zustand rather than in component state so the navbar, the drawer and the search
 * overlay can never disagree about what is open (03-code-standards.md §5).
 */

import { create } from "zustand";

export type Overlay = "menu" | "search" | "cart" | null;

type UiState = {
  overlay: Overlay;
  /** True once the page has scrolled far enough for the navbar to turn solid. */
  isScrolled: boolean;
  /** Direction of the last scroll event; the navbar hides on scroll down and shows on scroll up. */
  scrollDirection: "up" | "down";
  openOverlay: (overlay: Exclude<Overlay, null>) => void;
  closeOverlay: () => void;
  setScrolled: (isScrolled: boolean) => void;
  setScrollDirection: (direction: "up" | "down") => void;
};

export const useUiStore = create<UiState>((set) => ({
  overlay: null,
  isScrolled: false,
  scrollDirection: "up",
  openOverlay: (overlay) => set({ overlay }),
  closeOverlay: () => set({ overlay: null }),
  setScrolled: (isScrolled) => set({ isScrolled }),
  setScrollDirection: (scrollDirection) => set({ scrollDirection }),
}));
