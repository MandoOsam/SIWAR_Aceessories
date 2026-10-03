import { useEffect } from "react";

import { useUiStore } from "@/store/uiStore";

/**
 * Prevents the page behind an open overlay from scrolling, and restores the previous state on
 * close. Uses `overflow: clip` on the root so the layout never jumps.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) {
      return;
    }
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [locked]);
}

/** Calls a handler on Escape. Used by the drawer and the search overlay. */
export function useEscapeKey(active: boolean, handler: () => void): void {
  const isOpen = useUiStore((state) => state.overlay !== null);

  useEffect(() => {
    if (!active || !isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        handler();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, handler, isOpen]);
}
