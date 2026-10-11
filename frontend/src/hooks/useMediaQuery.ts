import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook (03-code-standards.md §5).
 *
 * Returns `false` on the first render (server / pre-hydration) and only touches `window.matchMedia`
 * inside the effect, so SSR and the initial client render agree and the layout never flashes the
 * wrong variant (e.g. the mobile filter sheet showing on a desktop-first paint at 1280px).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const onChange = (event: MediaQueryListEvent): void => setMatches(event.matches);
    mediaQueryList.addEventListener("change", onChange);
    return () => mediaQueryList.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}