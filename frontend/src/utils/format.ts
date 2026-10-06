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

/**
 * Converts a published phone number to the international form `tel:` and `wa.me` need.
 *
 * The owner publishes the local Egyptian format (`01041921899`), which only dials from inside
 * Egypt. Country code 20 is prefixed and the national trunk 0 is dropped. Inputs that are already
 * international are passed through, so this is safe to run on API data of unknown shape.
 */
export function toInternationalPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits === "") {
    return "";
  }
  // `00` is the international access prefix written out in full.
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  // Egyptian mobiles always start 01, so a leading 20 can only already be the country code.
  if (digits.startsWith("20")) {
    return `+${digits}`;
  }
  digits = digits.replace(/^0+/, "");
  return digits === "" ? "" : `+20${digits}`;
}
