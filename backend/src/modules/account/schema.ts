import { z } from "zod";

import { EGYPT_MOBILE, normalizePhone } from "@/lib/phone.js";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : value));

export const addressBodySchema = z
  .object({
    governorate: z.string().trim().min(1, "Governorate is required").max(80),
    city: z.string().trim().min(1, "City is required").max(120),
    street: z.string().trim().min(1, "Street is required").max(255),
    building: optionalText(60),
    apartment: optionalText(60),
    phone: z
      .string()
      .trim()
      .transform(normalizePhone)
      .refine((value) => EGYPT_MOBILE.test(value), "Enter an Egyptian mobile number (01xxxxxxxxx)"),
  })
  .strict();

export const addressIdParamSchema = z.object({ id: z.uuid() });

export const wishlistBodySchema = z.object({ productId: z.uuid() }).strict();

export const wishlistProductParamSchema = z.object({ productId: z.uuid() });

export const notificationListQuerySchema = z.object({
  unread: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const markNotificationsReadSchema = z
  .object({
    ids: z.array(z.uuid()).max(200).optional(),
  })
  .strict();

export const newsletterSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
  })
  .strict();

export type AddressBody = z.infer<typeof addressBodySchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
export type MarkNotificationsReadBody = z.infer<typeof markNotificationsReadSchema>;
export type NewsletterBody = z.infer<typeof newsletterSchema>;
