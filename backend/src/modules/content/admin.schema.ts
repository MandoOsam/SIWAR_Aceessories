import { z } from "zod";

import {
  blockKeyParamSchema,
  contactSettingsSchema,
  l10nField,
  pageSlugParamSchema,
  paymentMethodSchema,
  seoSchema,
  shippingSettingsSchema,
  socialLinkSchema,
  trustBadgesSchema,
} from "./schema.js";

export const adminBlockParamsSchema = blockKeyParamSchema;
export const adminPageParamsSchema = pageSlugParamSchema;

/** `data` is validated against the block key's schema in the service. */
export const contentBlockBodySchema = z.object({
  data: z.record(z.string(), z.unknown()),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export const pageBodySchema = z.object({
  title: l10nField(200),
  body: l10nField(5000),
});

const paymentMethodsSchema = z
  .array(paymentMethodSchema)
  .max(10)
  .refine(
    (methods) => new Set(methods.map((method) => method.id)).size === methods.length,
    "Payment method ids must be unique",
  );

export const updateSettingsSchema = z
  .object({
    storeName: z.string().trim().min(1).max(120).optional(),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, "Currency must be an ISO code like EGP")
      .optional(),
    shipping: shippingSettingsSchema.optional(),
    paymentMethods: paymentMethodsSchema.optional(),
    trustBadges: trustBadgesSchema.optional(),
    social: z.array(socialLinkSchema).max(10).optional(),
    contact: contactSettingsSchema.optional(),
    seo: seoSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type ContentBlockBody = z.infer<typeof contentBlockBodySchema>;
export type PageBody = z.infer<typeof pageBodySchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type AdminBlockParams = z.infer<typeof adminBlockParamsSchema>;
export type AdminPageParams = z.infer<typeof adminPageParamsSchema>;
