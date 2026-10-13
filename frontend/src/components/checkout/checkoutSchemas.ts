import { z } from "zod";

/** Egyptian mobiles are 11 digits and start `01` (05-ui-context.md §7.8). */
export const EGYPT_MOBILE_REGEX = /^01[0-9]{9}$/;

export const customerSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().regex(EGYPT_MOBILE_REGEX),
  email: z.union([z.literal(""), z.email()]),
});

export type CustomerData = z.infer<typeof customerSchema>;

export const addressSchema = z.object({
  governorate: z.string().min(1),
  city: z.string().trim().min(2),
  street: z.string().trim().min(3),
  building: z.string().trim(),
  apartment: z.string().trim(),
  notes: z.string().trim(),
});

export type AddressData = z.infer<typeof addressSchema>;

/** A transfer screenshot URL only needs validating when the customer actually typed one (upload is F6). */
export const paymentProofSchema = z.union([z.literal(""), z.string().trim().url()]);

export const emptyCustomer: CustomerData = { name: "", phone: "", email: "" };

export const emptyAddress: AddressData = {
  governorate: "",
  city: "",
  street: "",
  building: "",
  apartment: "",
  notes: "",
};

/** True when `value` satisfies `schema`; the step footer uses this to enable its Next button. */
export function isValid(schema: z.ZodType, value: unknown): boolean {
  return schema.safeParse(value).success;
}
