import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function NotFoundPage() {
  const { t } = useTranslation();

  useDocumentMeta(t("notFound.meta.title"), t("notFound.meta.description"));

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-heading text-display-lg leading-none text-accent-2/30">404</p>
      <h1 className="mt-4 font-heading text-heading">{t("notFound.title")}</h1>
      <p className="mt-4 max-w-md text-fg-muted">{t("notFound.body")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink to={ROUTES.home}>{t("notFound.backHome")}</ButtonLink>
        <ButtonLink to={ROUTES.shop} variant="secondary">
          {t("notFound.browseShop")}
        </ButtonLink>
        <ButtonLink to={ROUTES.search} variant="ghost">
          <Search className="me-2 h-4 w-4" />
          {t("notFound.search")}
        </ButtonLink>
      </div>
      <div className="mt-10">
        <p className="text-sm text-fg-muted">{t("notFound.popularTitle")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <ButtonLink to={ROUTES.category("necklaces")} size="sm" variant="secondary">
            {t("categories.necklaces")}
          </ButtonLink>
          <ButtonLink to={ROUTES.category("rings")} size="sm" variant="secondary">
            {t("categories.rings")}
          </ButtonLink>
          <ButtonLink to={ROUTES.category("bracelets")} size="sm" variant="secondary">
            {t("categories.bracelets")}
          </ButtonLink>
          <ButtonLink to={ROUTES.category("earrings")} size="sm" variant="secondary">
            {t("categories.earrings")}
          </ButtonLink>
          <ButtonLink to={ROUTES.category("sets")} size="sm" variant="secondary">
            {t("categories.sets")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
