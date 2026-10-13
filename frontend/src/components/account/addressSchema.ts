import { z } from "zod";

import { EGYPT_MOBILE_REGEX } from "@/components/checkout/checkoutSchemas";
import type { AddressInput } from "@/services/types";

/**
 * Zod schema for the saved-address form (D-035: Zod + controlled state, not `react-hook-form`).
 *
 * Messages are i18n keys so the page renders them with `t()`. Building and apartment stay optional
 * strings here and are trimmed to `undefined` when blank before they reach the service.
 */
export const addressInputSchema = z.object({
  governorate: z.string().min(1, { message: "account.addresses.errors.governorate" }),
  city: z.string().trim().min(2, { message: "account.addresses.errors.city" }),
  street: z.string().trim().min(3, { message: "account.addresses.errors.street" }),
  building: z.string().trim(),
  apartment: z.string().trim(),
  phone: z.string().trim().regex(EGYPT_MOBILE_REGEX, { message: "account.errors.phone" }),
});

export type AddressFormValues = z.infer<typeof addressInputSchema>;

export const emptyAddressForm: AddressFormValues = {
  governorate: "",
  city: "",
  street: "",
  building: "",
  apartment: "",
  phone: "",
};

/** Maps a stored `Address` into form values (empty optionals become blank strings). */
export function toFormValues(address: AddressInput): AddressFormValues {
  return {
    governorate: address.governorate,
    city: address.city,
    street: address.street,
    building: address.building ?? "",
    apartment: address.apartment ?? "",
    phone: address.phone,
  };
}

/** Blank optional fields are dropped before the value leaves the form. */
export function toAddressInput(values: AddressFormValues): AddressInput {
  const building = values.building.trim();
  const apartment = values.apartment.trim();
  return {
    governorate: values.governorate,
    city: values.city.trim(),
    street: values.street.trim(),
    building: building === "" ? undefined : building,
    apartment: apartment === "" ? undefined : apartment,
    phone: values.phone.trim(),
  };
}
