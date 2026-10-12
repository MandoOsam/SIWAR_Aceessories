import { useTranslation } from "react-i18next";

import { useLocale } from "@/hooks/useLocale";
import type { ShippingOption } from "@/services/types";
import { cn } from "@/utils/cn";
import { formatPrice, localize } from "@/utils/format";

export interface DeliveryStepProps {
  options: ShippingOption[];
  value: string;
  onChange: (id: string) => void;
  /** Current merchandise subtotal, used to decide which options are free. */
  subtotal: number;
}

/** Checkout step 3 — delivery service and fee (05-ui-context.md §7.8). */
export function DeliveryStep({ options, value, onChange, subtotal }: DeliveryStepProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-heading text-heading-sm">{t("checkout.delivery.title")}</h2>
        <p className="text-sm text-fg-muted">{t("checkout.delivery.body")}</p>
      </header>

      <ul className="space-y-3">
        {options.map((option) => {
          const isSelected = option.id === value;
          const isFree = option.freeAbove !== undefined && subtotal >= option.freeAbove;
          return (
            <li key={option.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors duration-500 ease-smooth",
                  isSelected ? "border-accent bg-surface-2" : "border-line hover:border-accent",
                )}
              >
                <input
                  type="radio"
                  name="delivery-option"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onChange(option.id)}
                  className="mt-1 accent-accent"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-medium text-fg">{localize(option.name, locale)}</span>
                  <span className="text-sm text-fg-muted">
                    {t("checkout.delivery.days", { min: option.minDays, max: option.maxDays })}
                  </span>
                </span>
                <span className="font-medium text-fg">
                  {isFree ? t("checkout.delivery.free") : formatPrice(option.fee, locale)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DeliveryStep;
