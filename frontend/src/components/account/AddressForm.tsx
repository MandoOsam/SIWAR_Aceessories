import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { collectErrors } from "@/components/auth/authSchemas";
import { Field, CONTROL_CLASSES } from "@/components/checkout/fields";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/hooks/useLocale";
import type { Governorate } from "@/services/types";
import { localize } from "@/utils/format";
import { addressInputSchema, type AddressFormValues } from "@/components/account/addressSchema";

export interface AddressFormProps {
  /** Starting values; pass `emptyAddressForm` for a new address. */
  initial: AddressFormValues;
  governorates: Governorate[];
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: AddressFormValues) => void;
  onCancel?: () => void;
}

/**
 * Reusable delivery-address form used by `/account/addresses` for both add and edit
 * (`05-ui-context.md` §7.12).
 *
 * Validates with Zod on submit, focuses the first invalid field and reports each error via `Field`
 * (which wires `aria-invalid`/`aria-describedby`). The page owns persistence and passes `pending`.
 */
export function AddressForm({
  initial,
  governorates,
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [form, setForm] = useState<AddressFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<AddressFormValues>) =>
    setForm((current) => ({ ...current, ...patch }));

  const fieldError = (key: string): string | undefined => {
    const messageKey = errors[key];
    return messageKey === undefined ? undefined : t(messageKey);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addressInputSchema.safeParse(form);
    if (!result.success) {
      const next = collectErrors(result.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first !== undefined) {
        document.getElementById(`address-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        id="address-governorate"
        label={t("account.addresses.fields.governorate")}
        error={fieldError("governorate")}
      >
        {({ describedBy, invalid }) => (
          <select
            id="address-governorate"
            name="governorate"
            value={form.governorate}
            onChange={(event) => update({ governorate: event.target.value })}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          >
            <option value="">{t("account.addresses.fields.governoratePlaceholder")}</option>
            {governorates.map((governorate) => (
              <option key={governorate.value} value={governorate.value}>
                {localize(governorate.name, locale)}
              </option>
            ))}
          </select>
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="address-city"
          label={t("account.addresses.fields.city")}
          error={fieldError("city")}
        >
          {({ describedBy, invalid }) => (
            <input
              id="address-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              value={form.city}
              onChange={(event) => update({ city: event.target.value })}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <Field
          id="address-phone"
          label={t("account.addresses.fields.phone")}
          error={fieldError("phone")}
        >
          {({ describedBy, invalid }) => (
            <input
              id="address-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              value={form.phone}
              onChange={(event) => update({ phone: event.target.value })}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>
      </div>

      <Field
        id="address-street"
        label={t("account.addresses.fields.street")}
        error={fieldError("street")}
      >
        {({ describedBy, invalid }) => (
          <input
            id="address-street"
            name="street"
            type="text"
            autoComplete="street-address"
            value={form.street}
            onChange={(event) => update({ street: event.target.value })}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={CONTROL_CLASSES}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="address-building"
          label={t("account.addresses.fields.building")}
          error={fieldError("building")}
          optionalLabel={t("auth.optional")}
        >
          {({ describedBy, invalid }) => (
            <input
              id="address-building"
              name="building"
              type="text"
              value={form.building}
              onChange={(event) => update({ building: event.target.value })}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <Field
          id="address-apartment"
          label={t("account.addresses.fields.apartment")}
          error={fieldError("apartment")}
          optionalLabel={t("auth.optional")}
        >
          {({ describedBy, invalid }) => (
            <input
              id="address-apartment"
              name="apartment"
              type="text"
              value={form.apartment}
              onChange={(event) => update({ apartment: event.target.value })}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
        {onCancel !== undefined ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            {t("account.addresses.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export default AddressForm;
