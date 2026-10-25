import type { L10n } from "./l10n.js";
import type { PaymentMethodId } from "./content.js";

/** Linear fulfilment path shown by the storefront order timeline. */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

/** Terminal states that stop the linear path. */
export const ORDER_TERMINAL_STATUSES = ["cancelled", "returned", "refunded"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderTerminalStatus = (typeof ORDER_TERMINAL_STATUSES)[number];
export type OrderState = OrderStatus | OrderTerminalStatus;

export const ALL_ORDER_STATUSES = [...ORDER_STATUSES, ...ORDER_TERMINAL_STATUSES] as const;

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Database spellings of the payment methods (02-architecture section 6). The
 * storefront id uses a dash (`vodafone-cash`), so the API boundary maps both
 * ways instead of leaking the DB convention to the frontend.
 */
export const DB_PAYMENT_METHODS = ["cod", "instapay", "vodafone_cash"] as const;
export type DbPaymentMethod = (typeof DB_PAYMENT_METHODS)[number];

export const TO_DB_PAYMENT_METHOD: Record<PaymentMethodId, DbPaymentMethod> = {
  cod: "cod",
  instapay: "instapay",
  "vodafone-cash": "vodafone_cash",
};

export const FROM_DB_PAYMENT_METHOD: Record<DbPaymentMethod, PaymentMethodId> = {
  cod: "cod",
  instapay: "instapay",
  vodafone_cash: "vodafone-cash",
};

export const DELIVERY_OPTION_IDS = ["standard", "express"] as const;
export type DeliveryOptionId = (typeof DELIVERY_OPTION_IDS)[number];

/** Delivery window used to derive `estimatedDelivery`; fees come from settings. */
export const DELIVERY_MAX_DAYS: Record<DeliveryOptionId, number> = {
  standard: 5,
  express: 2,
};

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

export type OrderVariant = {
  color?: string;
  size?: string;
};

/** Order line as stored in `order_items` and returned to the storefront. */
export type OrderItemDto = {
  productId: string;
  name: L10n;
  imageUrl?: string;
  variant?: OrderVariant;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderEventDto = {
  status: OrderState;
  note?: string;
  createdAt: string;
};

/** `GET /orders/track`, `GET /account/orders` and the admin order payload. */
export type OrderDto = {
  id: string;
  number: string;
  status: OrderState;
  customer: OrderCustomer;
  address: OrderAddress;
  deliveryOptionId: DeliveryOptionId;
  paymentMethod: PaymentMethodId;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  items: OrderItemDto[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  courier?: string;
  internalNote?: string;
  createdAt: string;
  estimatedDelivery?: string;
  timeline: OrderEventDto[];
};

export type CouponType = "percent" | "fixed";

/** Result of `POST /coupons/validate` (always answered with HTTP 200). */
export type CouponValidation =
  | {
      valid: true;
      code: string;
      type: CouponType;
      value: number;
      maxDiscount?: number;
      freeShipping?: boolean;
      discount: number;
    }
  | { valid: false; error: "invalid" | "min-order" };

export type OrderListFilters = {
  status?: OrderState;
  paymentStatus?: PaymentStatus;
  search?: string;
  page: number;
  limit: number;
};

/** `POST /orders` response (storefront `OrderResult`). */
export type OrderResult = {
  id: string;
  number: string;
  total: number;
};
