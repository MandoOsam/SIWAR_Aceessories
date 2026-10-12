import { useTranslation } from "react-i18next";

import { Field, CONTROL_CLASSES } from "@/components/checkout/fields";
import { useLocale } from "@/hooks/useLocale";
import type { PaymentMethod, PaymentMethodId } from "@/services/types";
import { cn } from "@/utils/cn";
import { isPlaceholder, localize } from "@/utils/format";

export interface PaymentStepProps {
  methods: PaymentMethod[];
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
  proofUrl: string;
  onProofChange: (url: string) => void;
  proofError: string | undefined;
  onProofBlur: () => void;
}

/** Checkout step 4 — payment method. Card payment is intentionally out of scope (05 §7.8). */
export function PaymentStep({
  methods,
  value,
  onChange,
  proofUrl,
  onProofChange,
  proofError,
  onProofBlur,
}: PaymentStepProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const selected = methods.find((method) => method.id === value);
  const showAccount =
    selected !== undefined &&
    selected.id !== "cod" &&
    selected.accountValue !== undefined &&
    !isPlaceholder(selected.accountValue);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-heading text-heading-sm">{t("checkout.payment.title")}</h2>
        <p className="text-sm text-fg-muted">{t("checkout.payment.body")}</p>
      </header>

      <ul className="space-y-3">
        {methods.map((method) => {
          const isSelected = method.id === value;
          return (
            <li key={method.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-card border p-4 transition-colors duration-500 ease-smooth",
                  isSelected ? "border-accent bg-surface-2" : "border-line hover:border-accent",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  className="accent-accent"
                />
                <span className="font-medium text-fg">{localize(method.name, locale)}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {selected !== undefined && selected.id !== "cod" ? (
        <div className="space-y-4 rounded-card border border-line bg-surface-2 p-4">
          {selected.instructions !== undefined ? (
            <p className="text-sm text-fg-muted">{localize(selected.instructions, locale)}</p>
          ) : null}
          {showAccount ? (
            <p className="text-sm text-fg">
              {t("checkout.payment.account")}: <span dir="ltr">{selected.accountValue}</span>
            </p>
          ) : null}
          <Field
            id="checkout-proof"
            label={t("checkout.payment.proof")}
            error={proofError}
            hint={t("checkout.payment.proofHint")}
            optionalLabel={t("checkout.optional")}
          >
            {({ describedBy, invalid }) => (
              <input
                id="checkout-proof"
                name="proof"
                type="url"
                inputMode="url"
                dir="ltr"
                value={proofUrl}
                onChange={(event) => onProofChange(event.target.value)}
                onBlur={onProofBlur}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={CONTROL_CLASSES}
              />
            )}
          </Field>
        </div>
      ) : null}
    </div>
  );
}

export default PaymentStep;
