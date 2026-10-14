import { useTranslation } from "react-i18next";

import { PolicySections } from "@/components/static/PolicySections";
import { StaticPageLayout } from "@/components/static/StaticPageLayout";
import { termsSections, termsUpdated } from "@/data/static/terms";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { formatDate } from "@/utils/format";

/**
 * `/terms` (05-ui-context.md §7.13): the terms and conditions.
 *
 * Content is placeholder copy in `data/static/terms.ts` (split out to stay under the 300-line cap)
 * and must be reviewed by the owner before launch.
 */
export default function TermsPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  useDocumentMeta(t("staticPages.terms.meta.title"), t("staticPages.terms.meta.description"));

  return (
    <StaticPageLayout title={t("staticPages.terms.title")} lead={t("staticPages.terms.lead")}>
      <p className="text-sm text-fg-muted">
        {t("staticPages.updated", { date: formatDate(termsUpdated, locale) })}
      </p>
      <div className="mt-6">
        <PolicySections sections={termsSections} />
      </div>
    </StaticPageLayout>
  );
}
