import type { z } from "zod";

import type { AddressData, CustomerData } from "@/components/checkout/checkoutSchemas";
import type { OrderInput, PaymentMethodId } from "@/services/types";
import type { CartItem } from "@/store/cartStore";

/**
 * Collects Zod issues for a controlled step form, but only for fields the customer has already
 * touched, and maps each field to its translated message key.
 */
export function collectTouchedErrors<T extends Record<string, string>>(
  schema: z.ZodType,
  value: T,
  touched: Set<keyof T>,
  keyFor: (field: keyof T) => string,
  translate: (key: string) => string,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  const result = schema.safeParse(value);
  if (result.success) {
    return errors;
  }
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof T | undefined;
    if (field !== undefined && touched.has(field) && errors[field] === undefined) {
      errors[field] = translate(keyFor(field));
    }
  }
  return errors;
}

function trimmedOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export interface BuildOrderInputParams {
  customer: CustomerData;
  address: AddressData;
  deliveryOptionId: string;
  paymentMethod: PaymentMethodId;
  proofUrl: string;
  items: CartItem[];
  couponCode: string | undefined;
}

/** Turns the checkout form state into the `POST /orders` body. */
export function buildOrderInput(params: BuildOrderInputParams): OrderInput {
  return {
    customer: {
      name: params.customer.name.trim(),
      phone: params.customer.phone.trim(),
      email: trimmedOrUndefined(params.customer.email),
    },
    address: {
      governorate: params.address.governorate,
      city: params.address.city.trim(),
      street: params.address.street.trim(),
      building: trimmedOrUndefined(params.address.building),
      apartment: trimmedOrUndefined(params.address.apartment),
      notes: trimmedOrUndefined(params.address.notes),
    },
    deliveryOptionId: params.deliveryOptionId,
    paymentMethod: params.paymentMethod,
    paymentProofUrl: trimmedOrUndefined(params.proofUrl),
    items: params.items.map((item) => ({
      productId: item.productId,
      variant: item.variant,
      qty: item.qty,
    })),
    couponCode: params.couponCode,
  };
}
