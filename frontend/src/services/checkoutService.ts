/**
 * Checkout service — delivery options, payment methods, governorates and order creation.
 *
 * One function per endpoint in `02-architecture.md` §7. Kept separate from `catalogService.ts`,
 * which is already at the 300-line limit (03-code-standards.md §2). The mock `createOrder` validates
 * stock and recomputes the total from `src/data/`, so the client never decides the price
 * (02-architecture.md §10).
 */

import { IS_MOCK_MODE } from "@/config/env";
import { governorates } from "@/data/governorates";
import { products } from "@/data/products";
import { shippingOptions, storeSettings } from "@/data/content";

import { validateCoupon } from "./catalogService";
import { getList, post } from "./http";
import { simulateLatency } from "./mockAdapter";
import type {
  Governorate,
  OrderInput,
  OrderResult,
  PaymentMethod,
  ShippingOption,
} from "./types";

/** Reasons `createOrder` can fail; the checkout UI maps each to a translated message. */
export type OrderErrorCode = "empty-cart" | "product-not-found" | "out-of-stock";

/** Typed failure thrown by `createOrder`. */
export class OrderError extends Error {
  readonly code: OrderErrorCode;

  constructor(code: OrderErrorCode) {
    super(code);
    this.name = "OrderError";
    this.code = code;
  }
}

/** `GET /shipping/governorates` */
export async function listGovernorates(signal?: AbortSignal): Promise<Governorate[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<Governorate>("/shipping/governorates", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return governorates;
}

/** `GET /shipping/options` */
export async function getShippingOptions(signal?: AbortSignal): Promise<ShippingOption[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<ShippingOption>("/shipping/options", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return shippingOptions;
}

/** `GET /payment-methods` — only the methods the owner left enabled. */
export async function getPaymentMethods(signal?: AbortSignal): Promise<PaymentMethod[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<PaymentMethod>("/payment-methods", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return storeSettings.paymentMethods.filter((method) => method.isEnabled);
}

/** First order number handed out; matches the `SW-10025`-style sample in the UI spec. */
let mockOrderSequence = 10024;

/**
 * `POST /orders`.
 *
 * Mock mode rejects empty carts, unknown products and quantities above the seeded stock, then
 * recomputes subtotal, shipping and coupon discount from `src/data/` before returning the
 * authoritative `total`.
 */
export async function createOrder(input: OrderInput, signal?: AbortSignal): Promise<OrderResult> {
  if (!IS_MOCK_MODE) {
    return post<OrderResult>("/orders", input, signal);
  }
  await simulateLatency(signal);

  if (input.items.length === 0) {
    throw new OrderError("empty-cart");
  }

  let subtotal = 0;
  for (const line of input.items) {
    const product = products.find((item) => item.id === line.productId);
    if (product === undefined) {
      throw new OrderError("product-not-found");
    }
    if (product.stock < line.qty) {
      throw new OrderError("out-of-stock");
    }
    subtotal += product.price * line.qty;
  }

  const option = shippingOptions.find((item) => item.id === input.deliveryOptionId);
  const baseFee = option?.fee ?? storeSettings.shipping.defaultFee;
  const freeAbove = option?.freeAbove;
  const shippingFee = freeAbove !== undefined && subtotal >= freeAbove ? 0 : baseFee;

  let discount = 0;
  let freeShipping = false;
  if (input.couponCode !== undefined && input.couponCode !== "") {
    const validation = await validateCoupon(input.couponCode, subtotal, signal);
    if (validation.valid) {
      discount = validation.discount;
      freeShipping = validation.freeShipping === true;
    }
  }

  const total = Math.round((subtotal + (freeShipping ? 0 : shippingFee) - discount) * 100) / 100;

  mockOrderSequence += 1;
  return {
    id: `mock-order-${mockOrderSequence}`,
    number: `SW-${mockOrderSequence}`,
    total,
  };
}
