import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";

/** Styled 404 for any unmatched route (05-ui-context.md §7.14). */
export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-heading text-display-lg leading-none text-accent-2/30">404</p>
      <h1 className="mt-4 font-heading text-heading">{t("common.notFoundTitle")}</h1>
      <p className="mt-4 max-w-md text-fg-muted">{t("common.notFoundBody")}</p>
      <ButtonLink to={ROUTES.home} className="mt-10">
        {t("common.goHome")}
      </ButtonLink>
      <p className="mt-10 text-sm text-fg-muted">
        <Link to={ROUTES.shop} className="underline underline-offset-4 hover:text-accent">
          {t("categories.shopAll")}
        </Link>
      </p>
    </div>
  );
}
