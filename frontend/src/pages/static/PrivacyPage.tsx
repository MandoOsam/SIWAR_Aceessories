import { useTranslation } from "react-i18next";

import { PolicySections } from "@/components/static/PolicySections";
import { StaticPageLayout } from "@/components/static/StaticPageLayout";
import { privacySections, privacyUpdated } from "@/data/static/privacy";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { formatDate } from "@/utils/format";

/**
 * `/privacy` (05-ui-context.md §7.13): the privacy policy.
 *
 * Content is placeholder copy in `data/static/privacy.ts` (split out to stay under the 300-line cap)
 * and must be reviewed by the owner before launch.
 */
export default function PrivacyPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  useDocumentMeta(t("staticPages.privacy.meta.title"), t("staticPages.privacy.meta.description"));

  return (
    <StaticPageLayout title={t("staticPages.privacy.title")} lead={t("staticPages.privacy.lead")}>
      <p className="text-sm text-fg-muted">
        {t("staticPages.updated", { date: formatDate(privacyUpdated, locale) })}
      </p>
      <div className="mt-6">
        <PolicySections sections={privacySections} />
      </div>
    </StaticPageLayout>
  );
}
