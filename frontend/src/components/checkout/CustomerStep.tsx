import { useTranslation } from "react-i18next";

import { Field, CONTROL_CLASSES } from "@/components/checkout/fields";
import type { CustomerData } from "@/components/checkout/checkoutSchemas";

export interface CustomerStepProps {
  value: CustomerData;
  onChange: (patch: Partial<CustomerData>) => void;
  errors: Partial<Record<keyof CustomerData, string>>;
  onBlur: (field: keyof CustomerData) => void;
}

/** Checkout step 1 — guest contact details (05-ui-context.md §7.8). */
export function CustomerStep({ value, onChange, errors, onBlur }: CustomerStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-heading text-heading-sm">{t("checkout.customer.title")}</h2>
        <p className="text-sm text-fg-muted">{t("checkout.customer.body")}</p>
      </header>

      <Field id="checkout-name" label={t("checkout.customer.name")} error={errors.name}>
        {({ describedBy, invalid }) => (
          <input
            id="checkout-name"
            name="name"
            type="text"
            autoComplete="name"
            value={value.name}
            onChange={(event) => onChange({ name: event.target.value })}
            onBlur={() => onBlur("name")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          />
        )}
      </Field>

      <Field
        id="checkout-phone"
        label={t("checkout.customer.phone")}
        error={errors.phone}
        hint={t("checkout.customer.phoneHint")}
      >
        {({ describedBy, invalid }) => (
          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            value={value.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            onBlur={() => onBlur("phone")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          />
        )}
      </Field>

      <Field
        id="checkout-email"
        label={t("checkout.customer.email")}
        error={errors.email}
        optionalLabel={t("checkout.optional")}
      >
        {({ describedBy, invalid }) => (
          <input
            id="checkout-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            value={value.email}
            onChange={(event) => onChange({ email: event.target.value })}
            onBlur={() => onBlur("email")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          />
        )}
      </Field>
    </div>
  );
}

export default CustomerStep;
