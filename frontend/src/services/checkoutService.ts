/**
 * Checkout service — delivery options, payment methods, governorates and order creation.
 *
 * One function per endpoint in `02-architecture.md` §7. Kept separate from `catalogService.ts`,
 * which is already at the 300-line limit (03-code-standards.md §2). The mock `createOrder` validates
 * stock and recomputes the total from `src/data/`, so the client never decides the price
 * (02-architecture.md §10).
 */

import { STORAGE_KEYS } from "@/config/app";
import { IS_MOCK_MODE } from "@/config/env";
import { governorates } from "@/data/governorates";
import { products } from "@/data/products";
import { shippingOptions, storeSettings } from "@/data/content";

import { validateCoupon } from "./catalogService";
import { getList, getOne, post, postVoid } from "./http";
import { simulateLatency } from "./mockAdapter";
import type {
  Governorate,
  Order,
  OrderInput,
  OrderItem,
  OrderResult,
  OrderState,
  PaymentMethod,
  ShippingOption,
} from "./types";

/** Reasons the order calls can fail; the UI maps each to a translated message. */
export type OrderErrorCode =
  | "empty-cart"
  | "product-not-found"
  | "out-of-stock"
  | "order-not-found"
  | "not-cancelable"
  | "not-returnable";

/** Statuses a customer may cancel from, and the only status a return may start from. */
const CANCELABLE_STATUSES: readonly OrderState[] = ["pending", "confirmed"];
const RETURNABLE_STATUSES: readonly OrderState[] = ["delivered"];

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

/**
 * Mock-only order store. Orders live in memory and are mirrored to `localStorage` so a refresh
 * does not lose them; the real API replaces this entirely in non-mock mode (02-architecture.md §7).
 */
const MOCK_ORDERS_KEY = STORAGE_KEYS.mockOrders;

/** First order number handed out; matches the `SW-10025`-style sample in the UI spec. */
const FIRST_ORDER_SEQUENCE = 10024;

let memoryOrders: Order[] | null = null;

/** Reads the order list once, then serves it from memory. Never throws. */
function readOrders(): Order[] {
  if (memoryOrders !== null) {
    return memoryOrders;
  }
  let parsed: Order[] = [];
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(MOCK_ORDERS_KEY);
    const value: unknown = raw === null ? null : JSON.parse(raw);
    if (Array.isArray(value)) {
      parsed = value as Order[];
    }
  } catch {
    parsed = [];
  }
  memoryOrders = parsed;
  return memoryOrders;
}

function writeOrders(orders: Order[]): void {
  memoryOrders = orders;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch {
    // Storage can be full or unavailable (private mode); the in-memory copy still works.
  }
}

/** Highest existing `SW-####` across persisted orders, so refreshes never reuse a number. */
function lastOrderSequence(): number {
  return readOrders().reduce((max, order) => {
    const value = Number(order.number.replace(/^SW-/, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, FIRST_ORDER_SEQUENCE);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * `POST /orders`.
 *
 * Mock mode rejects empty carts, unknown products and quantities above the seeded stock, then
 * recomputes subtotal, shipping and coupon discount from `src/data/` before returning the
 * authoritative `total` (02-architecture.md §10). The full order is recorded so
 * `/order/success/:id` and `/track-order` can read it back.
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
  const orderItems: OrderItem[] = [];
  for (const line of input.items) {
    const product = products.find((item) => item.id === line.productId);
    if (product === undefined) {
      throw new OrderError("product-not-found");
    }
    if (product.stock < line.qty) {
      throw new OrderError("out-of-stock");
    }
    const unitPrice = product.price;
    subtotal += unitPrice * line.qty;
    orderItems.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.images[0]?.url,
      variant: line.variant,
      qty: line.qty,
      unitPrice,
      lineTotal: Math.round(unitPrice * line.qty * 100) / 100,
    });
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

  const appliedShipping = freeShipping ? 0 : shippingFee;
  const total = Math.round((subtotal + appliedShipping - discount) * 100) / 100;

  const sequence = lastOrderSequence() + 1;
  const createdAt = new Date().toISOString();
  const order: Order = {
    id: `mock-order-${sequence}`,
    number: `SW-${sequence}`,
    status: "pending",
    customer: input.customer,
    address: input.address,
    deliveryOptionId: input.deliveryOptionId,
    paymentMethod: input.paymentMethod,
    paymentProofUrl: input.paymentProofUrl,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee: appliedShipping,
    discount: Math.round(discount * 100) / 100,
    total,
    couponCode: input.couponCode,
    createdAt,
    estimatedDelivery: addDays(createdAt, option?.maxDays ?? 5),
  };
  writeOrders([order, ...readOrders()]);

  return { id: order.id, number: order.number, total: order.total };
}

/** `GET /orders/:id` — used by the success page. */
export async function getOrderById(id: string, signal?: AbortSignal): Promise<Order | null> {
  if (!IS_MOCK_MODE) {
    return getOne<Order | null>(`/orders/${encodeURIComponent(id)}`, signal);
  }
  await simulateLatency(signal);
  return readOrders().find((order) => order.id === id) ?? null;
}

/** `GET /orders/track` — guest lookup; number and phone must both match. */
export async function getOrderByNumberAndPhone(
  number: string,
  phone: string,
  signal?: AbortSignal,
): Promise<Order | null> {
  if (!IS_MOCK_MODE) {
    const query = `number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`;
    return getOne<Order | null>(`/orders/track?${query}`, signal);
  }
  await simulateLatency(signal);
  const wantedNumber = number.trim().toUpperCase();
  const wantedPhone = phone.replace(/\D/g, "");
  return (
    readOrders().find(
      (order) =>
        order.number.toUpperCase() === wantedNumber &&
        order.customer.phone.replace(/\D/g, "") === wantedPhone,
    ) ?? null
  );
}

/** `GET /account/orders` — the signed-in customer's orders, newest first. */
export async function listOrders(signal?: AbortSignal): Promise<Order[]> {
  if (!IS_MOCK_MODE) {
    const response = await getList<Order>("/account/orders", signal);
    return response.data;
  }
  await simulateLatency(signal);
  return readOrders();
}

/** Moves a stored order to a new status after checking the transition is allowed. */
function transitionOrder(
  id: string,
  next: OrderState,
  allowed: readonly OrderState[],
  failure: OrderErrorCode,
): Order {
  const orders = readOrders();
  const current = orders.find((order) => order.id === id);
  if (current === undefined) {
    throw new OrderError("order-not-found");
  }
  if (!allowed.includes(current.status)) {
    throw new OrderError(failure);
  }
  const updated: Order = { ...current, status: next };
  writeOrders(orders.map((order) => (order.id === id ? updated : order)));
  return updated;
}

/** `POST /orders/:id/cancel` — allowed while the order is still `pending` or `confirmed`. */
export async function cancelOrder(id: string, signal?: AbortSignal): Promise<void> {
  if (!IS_MOCK_MODE) {
    await postVoid(`/orders/${encodeURIComponent(id)}/cancel`, {}, signal);
    return;
  }
  await simulateLatency(signal);
  transitionOrder(id, "cancelled", CANCELABLE_STATUSES, "not-cancelable");
}

/** `POST /orders/:id/return` — allowed once the order has been `delivered`. */
export async function requestReturn(id: string, signal?: AbortSignal): Promise<void> {
  if (!IS_MOCK_MODE) {
    await postVoid(`/orders/${encodeURIComponent(id)}/return`, {}, signal);
    return;
  }
  await simulateLatency(signal);
  transitionOrder(id, "returned", RETURNABLE_STATUSES, "not-returnable");
}
