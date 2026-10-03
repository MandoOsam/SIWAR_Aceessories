/**
 * Keeps i18next and `<html lang dir>` in step with the preferences store.
 *
 * The navbar language switch changes the store; this hook translates that into an i18next
 * language change and into the document direction. Mounted once, in `AppProviders`.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { applyPreferences, usePreferencesStore } from "@/store/preferencesStore";

export function useSyncPreferences(): void {
  const theme = usePreferencesStore((state) => state.theme);
  const locale = usePreferencesStore((state) => state.locale);
  const { i18n } = useTranslation();

  useEffect(() => {
    applyPreferences(theme, locale);
  }, [theme, locale]);

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);
}
