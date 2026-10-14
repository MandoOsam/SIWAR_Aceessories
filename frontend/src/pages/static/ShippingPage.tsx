import { useTranslation } from "react-i18next";

import { PolicySections } from "@/components/static/PolicySections";
import { StaticPageLayout } from "@/components/static/StaticPageLayout";
import { shippingOptions } from "@/data/content";
import { shippingSections } from "@/data/staticPages";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import { formatPrice, localize } from "@/utils/format";

/**
 * `/shipping` (05-ui-context.md §7.13): delivery methods, fees and times, plus the shipping policy.
 *
 * Fees and times come from the same `shippingOptions` the checkout uses, so the two never drift.
 */
export default function ShippingPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  useDocumentMeta(t("staticPages.shipping.meta.title"), t("staticPages.shipping.meta.description"));

  return (
    <StaticPageLayout title={t("staticPages.shipping.title")} lead={t("staticPages.shipping.lead")}>
      <section aria-label={t("staticPages.shipping.methodsTitle")}>
        <h2 className="font-heading text-heading-sm">{t("staticPages.shipping.methodsTitle")}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-fg-muted">
                <th scope="col" className="py-3 pe-4 text-start font-medium">
                  {t("staticPages.shipping.table.method")}
                </th>
                <th scope="col" className="py-3 pe-4 text-start font-medium">
                  {t("staticPages.shipping.table.time")}
                </th>
                <th scope="col" className="py-3 text-start font-medium">
                  {t("staticPages.shipping.table.fee")}
                </th>
              </tr>
            </thead>
            <tbody>
              {shippingOptions.map((option) => (
                <tr key={option.id} className="border-b border-line">
                  <th scope="row" className="py-3 pe-4 text-start font-normal text-fg">
                    {localize(option.name, locale)}
                  </th>
                  <td className="py-3 pe-4 text-fg-muted">
                    {t("staticPages.shipping.table.days", {
                      min: option.minDays,
                      max: option.maxDays,
                    })}
                  </td>
                  <td className="py-3 text-fg-muted">
                    {formatPrice(option.fee, locale)}
                    {option.freeAbove !== undefined ? (
                      <span className="block text-xs">
                        {t("staticPages.shipping.table.freeAbove", {
                          amount: formatPrice(option.freeAbove, locale),
                        })}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12" aria-label={t("staticPages.shipping.policyTitle")}>
        <PolicySections sections={shippingSections} />
      </section>
    </StaticPageLayout>
  );
}
