import { useTranslation } from "react-i18next";

import { IconButton } from "@/components/ui/IconButton";
import { SUPPORTED_LOCALES, type Locale } from "@/config/app";
import { usePreferencesStore } from "@/store/preferencesStore";
import { cn } from "@/utils/cn";

type LanguageSwitchProps = {
  className?: string;
};

/** Short label shown on the button: the language it switches to. */
const SHORT_LABEL: Record<Locale, string> = { ar: "EN", en: "ع" };

/**
 * Switches between Arabic (default, RTL) and English (LTR).
 *
 * The whole document direction flips from `src/store/preferencesStore.ts`, and the layout mirrors
 * itself because it only uses logical Tailwind utilities (`ms-`, `pe-`, `text-start`, …).
 */
export function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { t } = useTranslation();
  const locale = usePreferencesStore((state) => state.locale);
  const setLocale = usePreferencesStore((state) => state.setLocale);

  const nextLocale: Locale = SUPPORTED_LOCALES.find((item) => item !== locale) ?? "en";
  const label = t("language.switch");

  return (
    <IconButton
      label={label}
      onClick={() => setLocale(nextLocale)}
      className={cn("font-heading text-xs tracking-widest", className)}
      icon={<span aria-hidden="true">{SHORT_LABEL[nextLocale]}</span>}
    />
  );
}
