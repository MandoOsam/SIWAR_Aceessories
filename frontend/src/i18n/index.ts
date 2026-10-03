/**
 * i18next setup.
 *
 * Arabic is the default language and the default direction (D-013). Language and direction are
 * driven by `src/store/preferencesStore.ts`; that store is the single source of truth so the
 * navbar switch and the `<html lang dir>` attributes can never disagree.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE } from "@/config/app";

import ar from "@/locales/ar.json";
import en from "@/locales/en.json";

export const resources = {
  ar: { translation: ar },
  en: { translation: en },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: "en",
  defaultNS: "translation",
  interpolation: { escapeValue: false },
  returnObjects: true,
});

export default i18n;
