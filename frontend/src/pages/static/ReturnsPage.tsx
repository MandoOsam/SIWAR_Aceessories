import { useTranslation } from "react-i18next";

import { PolicySections } from "@/components/static/PolicySections";
import { StaticPageLayout } from "@/components/static/StaticPageLayout";
import { ButtonLink } from "@/components/ui/Button";
import { returnsSections } from "@/data/staticPages";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * `/returns` (05-ui-context.md §7.13): the return/exchange policy and the refund timeline.
 * People who need to start a return are pointed at `/contact`.
 */
export default function ReturnsPage() {
  const { t } = useTranslation();

  useDocumentMeta(t("staticPages.returns.meta.title"), t("staticPages.returns.meta.description"));

  return (
    <StaticPageLayout title={t("staticPages.returns.title")} lead={t("staticPages.returns.lead")}>
      <PolicySections sections={returnsSections} />

      <div className="mt-10 rounded-card border border-line bg-surface p-6 text-center">
        <p className="text-fg-muted">{t("staticPages.returns.contactPrompt")}</p>
        <ButtonLink to="/contact" variant="secondary" className="mt-4">
          {t("staticPages.returns.contactCta")}
        </ButtonLink>
      </div>
    </StaticPageLayout>
  );
}
