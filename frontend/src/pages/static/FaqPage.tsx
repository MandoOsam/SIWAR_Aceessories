import { useTranslation } from "react-i18next";

import { Accordion, type AccordionItem } from "@/components/Accordion";
import { StaticPageLayout } from "@/components/static/StaticPageLayout";
import { ButtonLink } from "@/components/ui/Button";
import { faqEntries } from "@/data/staticPages";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";

/**
 * `/faq` (05-ui-context.md §7.13): the frequently asked questions as a disclosure list, reusing the
 * F4 `Accordion`. Answers are bilingual data; only the labels are i18n keys. People who still have a
 * question are pointed at `/contact`.
 */
export default function FaqPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  useDocumentMeta(t("staticPages.faq.meta.title"), t("staticPages.faq.meta.description"));

  const items: AccordionItem[] = faqEntries.map((entry) => ({
    id: entry.id,
    title: localize(entry.question, locale),
    content: <p>{localize(entry.answer, locale)}</p>,
  }));

  return (
    <StaticPageLayout title={t("staticPages.faq.title")} lead={t("staticPages.faq.lead")}>
      <Accordion items={items} allowMultiple />

      <div className="mt-10 rounded-card border border-line bg-surface p-6 text-center">
        <p className="text-fg-muted">{t("staticPages.faq.contactPrompt")}</p>
        <ButtonLink to="/contact" variant="secondary" className="mt-4">
          {t("staticPages.faq.contactCta")}
        </ButtonLink>
      </div>
    </StaticPageLayout>
  );
}
