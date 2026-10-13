/**
 * Order and checkout contract types (02-architecture.md §7).
 *
 * Split out of `types.ts` to keep that barrel within the 300-line limit (D-048); `types.ts`
 * re-exports everything here, so imports keep using `@/services/types`.
 */

import type { L10n, PaymentMethodId } from "./types";

/** Customer details captured at checkout (`POST /orders`, 02-architecture.md §7). */
export type OrderCustomer = {
  name: string;
  phone: string;
  email?: string;
};

export type OrderAddress = {
  governorate: string;
  city: string;
  street: string;
  building?: string;
  apartment?: string;
  notes?: string;
};

export type OrderLineInput = {
  productId: string;
  variant: { color?: string; size?: string };
  qty: number;
};

/** Body of `POST /orders`. */
export type OrderInput = {
  customer: OrderCustomer;
  address: OrderAddress;
  deliveryOptionId: string;
  paymentMethod: PaymentMethodId;
  /** Screenshot URL for a transfer method; real uploads arrive in F6. */
  paymentProofUrl?: string;
  items: OrderLineInput[];
  couponCode?: string;
};

export type OrderResult = {
  id: string;
  number: string;
  /** Grand total the server computed; the client never decides the price (02-architecture.md §10). */
  total: number;
};

/** Linear fulfilment path shown by the order timeline. */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;
/** Terminal states that stop the linear path (shown differently on the timeline). */
export const ORDER_TERMINAL_STATUSES = ["cancelled", "returned", "refunded"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderTerminalStatus = (typeof ORDER_TERMINAL_STATUSES)[number];
export type OrderState = OrderStatus | OrderTerminalStatus;

export type OrderItem = {
  productId: string;
  name: L10n;
  imageUrl?: string;
  variant?: { color?: string; size?: string };
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  number: string;
  status: OrderState;
  customer: OrderCustomer;
  address: OrderAddress;
  deliveryOptionId: string;
  paymentMethod: PaymentMethodId;
  paymentProofUrl?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  estimatedDelivery?: string;
};
