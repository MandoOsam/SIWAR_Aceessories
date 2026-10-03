/**
 * User preferences: theme and language.
 *
 * Theme and language are the only values written to `localStorage` (they are not personal data —
 * 03-code-standards.md §5). They are also applied to `<html>` as a `dark` class plus `lang` and
 * `dir` attributes, which is what makes dark/light and RTL/LTR switching work without a reload.
 *
 * This store is the single source of truth: the navbar switches call it, and `applyPreferences`
 * is the only thing that touches `<html>`. The inline script in `index.html` repeats the same
 * logic so the very first paint already matches the saved preference.
 */

import { create } from "zustand";

import { DEFAULT_LOCALE, DIRECTION_BY_LOCALE, STORAGE_KEYS, type Locale } from "@/config/app";

export type Theme = "light" | "dark";

type PreferencesState = {
  theme: Theme;
  locale: Locale;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
};

export function readStoredTheme(): Theme | null {
  const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function readStoredLocale(): Locale | null {
  const stored = window.localStorage.getItem(STORAGE_KEYS.locale);
  return stored === "ar" || stored === "en" ? stored : null;
}

/** Dark is the product default (D-013); on a first visit the OS preference wins. */
export function readInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }
  return (
    readStoredTheme() ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

export function readInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  return readStoredLocale() ?? DEFAULT_LOCALE;
}

/** Writes theme, language and direction onto `<html>`. */
export function applyPreferences(theme: Theme, locale: Locale): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  root.lang = locale;
  root.dir = DIRECTION_BY_LOCALE[locale];
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  theme: readInitialTheme(),
  locale: readInitialLocale(),

  setTheme: (theme) => {
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
      return { theme };
    }),

  setLocale: (locale) => {
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    set({ locale });
  },
}));
