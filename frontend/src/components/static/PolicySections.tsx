import { useLocale } from "@/hooks/useLocale";
import type { PolicySection } from "@/data/staticPages";
import { localize } from "@/utils/format";

interface PolicySectionsProps {
  sections: PolicySection[];
}

/**
 * Renders a list of bilingual policy sections (shipping, returns, privacy, terms) as titled
 * `<section>` blocks. Shared by the F7.1b static pages so each page stays a thin content wrapper.
 */
export function PolicySections({ sections }: PolicySectionsProps) {
  const { locale } = useLocale();

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="font-heading text-heading-sm">{localize(section.title, locale)}</h2>
          <div className="mt-3 space-y-3 text-fg-muted">
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {localize(paragraph, locale)}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default PolicySections;
