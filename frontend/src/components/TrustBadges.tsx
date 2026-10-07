import { CheckCircle, CreditCard, RotateCcw, Truck } from "lucide-react";

import { useLocale } from "@/hooks/useLocale";
import { storeSettings } from "@/data/content";

const items = [
  {
    key: "shipping",
    icon: Truck,
    labelEn: "Free shipping over EGP 1000",
    labelAr: "شحن مجاني فوق ١٠٠٠ جنيه",
    valueKey: "freeShippingThreshold",
  },
  {
    key: "payment",
    icon: CreditCard,
    labelEn: "Secure payment",
    labelAr: "دفع آمن",
  },
  {
    key: "returns",
    icon: RotateCcw,
    labelEn: "Easy returns",
    labelAr: "إرجاع سهل",
    valueKey: "returnDays",
  },
  {
    key: "support",
    icon: CheckCircle,
    labelEn: "Customer support",
    labelAr: "دعم العملاء",
  },
];

export function TrustBadges() {
  const { locale } = useLocale();

  return (
    <section className="container-page py-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center gap-3 rounded-card bg-surface p-4">
              <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              <span className="text-sm text-fg">
                {locale === "ar" ? item.labelAr : item.labelEn}
                {item.valueKey === "freeShippingThreshold" && ` (${storeSettings.shipping?.freeAbove ?? 1000})`}
                {item.valueKey === "returnDays" && ` (${14} ${locale === "ar" ? "أيام" : "days"})`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustBadges;
