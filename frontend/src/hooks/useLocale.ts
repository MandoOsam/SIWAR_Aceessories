import { useTranslation } from "react-i18next";

import { usePreferencesStore } from "@/store/preferencesStore";
import type { Locale } from "@/config/app";

/**
 * Reads the active language and exposes the bilingual-field picker.
 *
 * `03-code-standards.md` §1 forbids `any`, so bilingual values coming back from i18next are
 * checked here instead of being cast at every call site.
 */
export function useLocale(): {
  locale: Locale;
  dir: "rtl" | "ltr";
  isRtl: boolean;
} {
  const locale = usePreferencesStore((state) => state.locale);
  const { t } = useTranslation();

  // `t` is intentionally read so the component re-renders when the language changes.
  void t;

  return {
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    isRtl: locale === "ar",
  };
}
