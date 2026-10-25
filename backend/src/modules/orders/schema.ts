import { z } from "zod";

import {
  ALL_ORDER_STATUSES,
  DELIVERY_OPTION_IDS,
  PAYMENT_STATUSES,
} from "@/types/orders.js";
import { PAYMENT_METHOD_IDS } from "@/types/content.js";

const EGYPT_MOBILE = /^01[0125][0-9]{8}$/;

/** Keeps only digits so `+20 101 234 5678`, `0101-234-5678` and `01012345678` all match. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120, "Name is too long"),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((value) => EGYPT_MOBILE.test(value), "Enter an Egyptian mobile number (01xxxxxxxxx)"),
  email: z.email().max(254).optional(),
});

const addressSchema = z.object({
  governorate: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  street: z.string().trim().min(1).max(200),
  building: z.string().trim().min(1).max(40).optional(),
  apartment: z.string().trim().min(1).max(40).optional(),
  notes: z.string().trim().max(500).optional(),
});

const variantSchema = z
  .object({
    color: z.string().trim().min(1).max(40).optional(),
    size: z.string().trim().min(1).max(40).optional(),
  })
  .strict();

const lineSchema = z
  .object({
    productId: z.uuid(),
    variant: variantSchema,
    qty: z.number().int().min(1).max(99),
  })
  .strict();

/** Body of `POST /orders` (frontend `OrderInput`). Prices are never accepted from the client. */
export const createOrderSchema = z
  .object({
    customer: customerSchema,
    address: addressSchema,
    deliveryOptionId: z.enum(DELIVERY_OPTION_IDS),
    paymentMethod: z.enum(PAYMENT_METHOD_IDS),
    paymentProofUrl: z.string().trim().min(1).max(2048).optional(),
    items: z.array(lineSchema).min(1, "Cart is empty").max(50),
    couponCode: z
      .string()
      .trim()
      .max(40)
      .transform((value) => value.toUpperCase())
      .optional(),
  })
  .strict();

export const trackOrderQuerySchema = z.object({
  number: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .transform((value) => value.toUpperCase()),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((value) => value.length >= 10, "Enter the mobile number used at checkout"),
});

export const couponValidateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Coupon code is required")
      .max(40)
      .transform((value) => value.toUpperCase()),
    subtotal: z.number().nonnegative().max(9_999_999),
  })
  .strict();

export const orderIdParamSchema = z.object({ id: z.uuid() });

export const adminOrderListQuerySchema = z.object({
  status: z.enum(ALL_ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(ALL_ORDER_STATUSES),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export const updateOrderPaymentSchema = z
  .object({
    paymentStatus: z.enum(PAYMENT_STATUSES),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type TrackOrderQuery = z.infer<typeof trackOrderQuerySchema>;
export type CouponValidateInput = z.infer<typeof couponValidateSchema>;
export type OrderIdParams = z.infer<typeof orderIdParamSchema>;
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderPaymentInput = z.infer<typeof updateOrderPaymentSchema>;
