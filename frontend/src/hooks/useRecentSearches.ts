import { useCallback, useEffect, useState } from "react";

/** localStorage key for recent search terms. Kept here so F1's `STORAGE_KEYS` stays untouched. */
const STORAGE_KEY = "siwar-recent-searches";

/** 05-ui-context.md §7.6 / D-021: query strings only, most recent first, capped at five. */
const MAX_RECENT = 5;

function readStored(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export type UseRecentSearchesResult = {
  recents: string[];
  addRecent: (term: string) => void;
  clearRecents: () => void;
};

/**
 * Recent search terms in `localStorage` (no personal data, §7.6 / D-021).
 *
 * SSR-safe: the initial read and every write guard against a missing `window`, and a corrupt or
 * unavailable store degrades to an empty list instead of throwing.
 */
export function useRecentSearches(): UseRecentSearchesResult {
  const [recents, setRecents] = useState<string[]>(readStored);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
    } catch {
      // Private mode or a full store: recents are a convenience, never required.
    }
  }, [recents]);

  const addRecent = useCallback((term: string) => {
    const next = term.trim();
    if (next === "") {
      return;
    }
    setRecents((current) =>
      [next, ...current.filter((item) => item.toLowerCase() !== next.toLowerCase())].slice(
        0,
        MAX_RECENT,
      ),
    );
  }, []);

  const clearRecents = useCallback(() => setRecents([]), []);

  return { recents, addRecent, clearRecents };
}
