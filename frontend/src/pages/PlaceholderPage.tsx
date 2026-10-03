import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";

type PlaceholderPageProps = {
  /** Phase that will build this route, shown so nothing looks accidentally broken. */
  phase: string;
};

/**
 * Temporary stand-in for routes whose page is built in a later phase.
 *
 * It keeps navbar links working during F1 without inventing page content, and it disappears
 * automatically as each real page replaces it.
 */
export default function PlaceholderPage({ phase }: PlaceholderPageProps) {
  const { t } = useTranslation();
  const { slug } = useParams();

  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-heading text-xs uppercase tracking-[0.3em] text-accent">{phase}</p>
      <h1 className="font-heading text-heading">
        {slug === undefined ? t("common.comingSoon", { phase }) : slug}
      </h1>
      <p className="max-w-md text-fg-muted">{t("common.comingSoon", { phase })}</p>
      <ButtonLink to={ROUTES.home} variant="secondary" className="mt-6">
        {t("common.goHome")}
      </ButtonLink>
    </div>
  );
}
