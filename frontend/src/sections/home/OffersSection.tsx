import { useTranslation } from "react-i18next";

import ProductSlider from "@/components/ProductSlider";
import { products } from "@/data/products";
import { useLocale } from "@/hooks/useLocale";
import { formatNumber } from "@/utils/format";
import useCountdown from "@/hooks/useCountdown";

export function OffersSection() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  
  // Use a future date for demo; in real case would come from content.ts
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const countdown = useCountdown(endDate);
  
  const discountedProducts = products
    .filter((p) => p.discountPercent !== undefined && p.discountPercent > 0)
    .slice(0, 8);

  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-heading-sm text-fg">{t("product.offers", "Offers")}</h2>
          <p className="text-sm text-fg-muted">{t("product.limitedTime", "Limited time offers")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-card bg-surface-2 p-3">
          {[
            { label: t("common.days", "Days"), value: countdown.days },
            { label: t("common.hours", "Hours"), value: countdown.hours },
            { label: t("common.minutes", "Minutes"), value: countdown.minutes },
            { label: t("common.seconds", "Seconds"), value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center px-2">
              <span className="font-heading text-lg text-fg tabular-nums">
                {formatNumber(item.value, locale)}
              </span>
              <span className="text-xs text-fg-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <ProductSlider products={discountedProducts} />
    </section>
  );
}

export default OffersSection;
