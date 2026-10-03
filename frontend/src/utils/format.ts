/**
 * Formatting helpers.
 *
 * Prices and numbers follow the active language, currency is always EGP and the label is
 * "ج.م" in Arabic (05-ui-context.md §5.1). `Intl` is used instead of a date library so no extra
 * dependency is needed (03-code-standards.md §6).
 */

import type { Locale } from "@/config/app";
import type { L10n } from "@/services/types";

const INTL_LOCALE: Record<Locale, string> = {
  ar: "ar-EG",
  en: "en-EG",
};

const CURRENCY_LABEL: Record<Locale, string> = {
  ar: "ج.م",
  en: "EGP",
};

/** Picks the right language out of a bilingual field. */
export function localize(value: L10n, locale: Locale): string {
  return locale === "ar" ? value.ar : value.en;
}

export function formatPrice(amount: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(INTL_LOCALE[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    numberingSystem: "latn",
  }).format(amount);

  return locale === "ar"
    ? `${formatted} ${CURRENCY_LABEL.ar}`
    : `${CURRENCY_LABEL.en} ${formatted}`;
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], { numberingSystem: "latn" }).format(value);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: "medium",
    numberingSystem: "latn",
  }).format(new Date(iso));
}

/** Marker left in mock content for every value the owner still has to supply. */
const PLACEHOLDER_MARKER = "TODO(Mando)";

/**
 * True when a value coming from the API is still a placeholder.
 *
 * Components call this to drop incomplete entries instead of rendering a broken link or a visible
 * `TODO(Mando)`. The marker itself stays in the mock data so it is obvious what needs filling in.
 */
export function isPlaceholder(value: string | null | undefined): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  const trimmed = value.trim();
  return trimmed === "" || trimmed.startsWith(PLACEHOLDER_MARKER);
}
