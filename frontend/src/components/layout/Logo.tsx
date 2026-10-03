import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { BRAND_NAME, ROUTES } from "@/config/app";
import { cn } from "@/utils/cn";

type LogoProps = {
  className?: string;
  /** Rendered as a link on the home page, as plain text everywhere else. */
  asLink?: boolean;
};

/**
 * The SIWAR wordmark.
 *
 * Uses `siwar-logo.svg`, whose paths are filled with `currentColor`, so one file works in both
 * themes: the ink follows the `--text` token instead of baking in a colour.
 */
export function Logo({ className, asLink = true }: LogoProps) {
  const { t } = useTranslation();

  const image = (
    <img
      src="/assets/logo/siwar-logo.svg"
      alt={BRAND_NAME}
      width={1040}
      height={270}
      className={cn("h-8 w-auto text-fg sm:h-9 lg:h-10", className)}
    />
  );

  if (!asLink) {
    return image;
  }

  return (
    <Link
      to={ROUTES.home}
      aria-label={t("brand.homeLabel")}
      className="inline-flex min-h-11 shrink-0 items-center py-1"
    >
      {image}
    </Link>
  );
}
