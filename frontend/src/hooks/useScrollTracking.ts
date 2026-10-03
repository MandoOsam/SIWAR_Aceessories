import { useEffect, useRef } from "react";

import { useUiStore } from "@/store/uiStore";

/** Distance in pixels after which the navbar stops being transparent. */
const SCROLL_THRESHOLD_PX = 24;

/** Ignore tiny scroll jitter so the navbar does not flicker while the user reads. */
const DIRECTION_DELTA_PX = 6;

/**
 * Starts tracking scroll position and direction for the navbar.
 *
 * The flag lives in the UI store (not in local state) because the navbar and the layout both need
 * to read it without prop drilling.
 */
export function useScrollTracking(): void {
  const lastYRef = useRef(0);
  const setScrolled = useUiStore((state) => state.setScrolled);
  const setScrollDirection = useUiStore((state) => state.setScrollDirection);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const handleScroll = (): void => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastYRef.current;

      if (Math.abs(delta) >= DIRECTION_DELTA_PX) {
        setScrollDirection(delta > 0 ? "down" : "up");
        lastYRef.current = currentY;
      }

      setScrolled(currentY > SCROLL_THRESHOLD_PX);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrolled, setScrollDirection]);
}
