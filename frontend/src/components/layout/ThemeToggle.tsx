import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@/components/ui/IconButton";
import { usePreferencesStore } from "@/store/preferencesStore";

type ThemeToggleProps = {
  className?: string;
};

/**
 * Switches between dark and light.
 *
 * The label always names the theme being switched to, so it stays correct in both states and
 * reads correctly for a screen reader.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);

  const isDark = theme === "dark";
  const label = t(isDark ? "theme.light" : "theme.dark");

  return (
    <IconButton
      label={label}
      onClick={toggleTheme}
      aria-pressed={isDark}
      className={className}
      icon={
        <span className="relative block size-5">
          <Sun
            aria-hidden="true"
            className="absolute inset-0 size-5 transition-opacity duration-500 ease-smooth"
            style={{ opacity: isDark ? 0.25 : 1 }}
          />
          <Moon
            aria-hidden="true"
            className="absolute inset-0 size-5 transition-opacity duration-500 ease-smooth"
            style={{ opacity: isDark ? 1 : 0.25 }}
          />
        </span>
      }
    />
  );
}
