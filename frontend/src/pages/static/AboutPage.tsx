import { useTranslation } from "react-i18next";

import { SectionHeading } from "@/components/SectionHeading";
import { StaticPageLayout } from "@/components/static/StaticPageLayout";
import { aboutStory } from "@/data/staticPages";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";

/**
 * `/about` (05-ui-context.md §7.13, §9): the brand story and the stainless-steel benefits.
 *
 * Copy is bilingual data (`data/staticPages.ts`); only the labels are i18n keys.
 */
export default function AboutPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  useDocumentMeta(t("staticPages.about.meta.title"), t("staticPages.about.meta.description"));

  return (
    <StaticPageLayout title={t("staticPages.about.title")}>
      <article className="space-y-5 text-fg-muted">
        {aboutStory.paragraphs.map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {localize(paragraph, locale)}
          </p>
        ))}
      </article>

      <section className="mt-12" aria-label={t("staticPages.about.valuesTitle")}>
        <SectionHeading title={t("staticPages.about.valuesTitle")} />
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {aboutStory.values.map((value) => (
            <li key={value.id} className="rounded-card border border-line bg-surface p-5">
              <h3 className="font-heading text-heading-sm">{localize(value.title, locale)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {localize(value.body, locale)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </StaticPageLayout>
  );
}
