import { useTranslation } from "react-i18next";

import { Field, CONTROL_CLASSES } from "@/components/checkout/fields";
import type { AddressData } from "@/components/checkout/checkoutSchemas";
import { useLocale } from "@/hooks/useLocale";
import type { Governorate } from "@/services/types";
import { localize } from "@/utils/format";

export interface AddressStepProps {
  value: AddressData;
  onChange: (patch: Partial<AddressData>) => void;
  errors: Partial<Record<keyof AddressData, string>>;
  onBlur: (field: keyof AddressData) => void;
  governorates: Governorate[];
}

/** Checkout step 2 — delivery address (05-ui-context.md §7.8). */
export function AddressStep({ value, onChange, errors, onBlur, governorates }: AddressStepProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-heading text-heading-sm">{t("checkout.address.title")}</h2>
        <p className="text-sm text-fg-muted">{t("checkout.address.body")}</p>
      </header>

      <Field
        id="checkout-governorate"
        label={t("checkout.address.governorate")}
        error={errors.governorate}
      >
        {({ describedBy, invalid }) => (
          <select
            id="checkout-governorate"
            name="governorate"
            value={value.governorate}
            onChange={(event) => onChange({ governorate: event.target.value })}
            onBlur={() => onBlur("governorate")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          >
            <option value="">{t("checkout.address.governoratePlaceholder")}</option>
            {governorates.map((governorate) => (
              <option key={governorate.value} value={governorate.value}>
                {localize(governorate.name, locale)}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field id="checkout-city" label={t("checkout.address.city")} error={errors.city}>
        {({ describedBy, invalid }) => (
          <input
            id="checkout-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            value={value.city}
            onChange={(event) => onChange({ city: event.target.value })}
            onBlur={() => onBlur("city")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          />
        )}
      </Field>

      <Field id="checkout-street" label={t("checkout.address.street")} error={errors.street}>
        {({ describedBy, invalid }) => (
          <input
            id="checkout-street"
            name="street"
            type="text"
            autoComplete="street-address"
            value={value.street}
            onChange={(event) => onChange({ street: event.target.value })}
            onBlur={() => onBlur("street")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="checkout-building"
          label={t("checkout.address.building")}
          error={errors.building}
          optionalLabel={t("checkout.optional")}
        >
          {({ describedBy, invalid }) => (
            <input
              id="checkout-building"
              name="building"
              type="text"
              value={value.building}
              onChange={(event) => onChange({ building: event.target.value })}
              onBlur={() => onBlur("building")}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <Field
          id="checkout-apartment"
          label={t("checkout.address.apartment")}
          error={errors.apartment}
          optionalLabel={t("checkout.optional")}
        >
          {({ describedBy, invalid }) => (
            <input
              id="checkout-apartment"
              name="apartment"
              type="text"
              value={value.apartment}
              onChange={(event) => onChange({ apartment: event.target.value })}
              onBlur={() => onBlur("apartment")}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>
      </div>

      <Field
        id="checkout-notes"
        label={t("checkout.address.notes")}
        error={errors.notes}
        optionalLabel={t("checkout.optional")}
      >
        {({ describedBy, invalid }) => (
          <textarea
            id="checkout-notes"
            name="notes"
            rows={3}
            value={value.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            onBlur={() => onBlur("notes")}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          />
        )}
      </Field>
    </div>
  );
}

export default AddressStep;
