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
 * `siwar-logo.svg` is filled with `currentColor`, but an SVG loaded through `<img>` is its own
 * isolated document: `currentColor` there resolves to black and never inherits the page, so the
 * wordmark could not follow the theme (it vanished on the dark hero while the light theme was
 * active). Instead we paint a `bg-current` box and mask it with the SVG, so the logo takes the
 * inherited text colour (`--text` normally, `--ink-on-hero` over the hero) and stays a crisp
 * vector with no extra asset or dependency.
 */
export function Logo({ className, asLink = true }: LogoProps) {
  const { t } = useTranslation();

  const image = (
    <span
      role="img"
      aria-label={BRAND_NAME}
      className={cn("inline-block aspect-[1040/270] h-8 bg-current sm:h-9 lg:h-10", className)}
      style={{
        WebkitMaskImage: "url(/assets/logo/siwar-logo.svg)",
        maskImage: "url(/assets/logo/siwar-logo.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
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
