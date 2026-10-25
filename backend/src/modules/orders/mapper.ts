import type { OrderEvent } from "@/db/schema/orderEvents.js";
import type { OrderItem } from "@/db/schema/orderItems.js";
import type { Order } from "@/db/schema/orders.js";
import {
  DELIVERY_MAX_DAYS,
  FROM_DB_PAYMENT_METHOD,
  type OrderDto,
  type OrderEventDto,
  type OrderItemDto,
  type OrderVariant,
} from "@/types/orders.js";
import { addDays, roundMoney } from "./money.js";

function toVariant(value: OrderVariant | null): OrderVariant | undefined {
  if (value === null) return undefined;
  const variant: OrderVariant = {};
  if (value.color !== undefined) variant.color = value.color;
  if (value.size !== undefined) variant.size = value.size;
  return Object.keys(variant).length === 0 ? undefined : variant;
}

function toItemDto(row: OrderItem): OrderItemDto {
  const unitPrice = Number(row.unitPrice);
  const variant = toVariant(row.variant);
  return {
    productId: row.productId ?? "",
    name: row.nameSnapshot,
    ...(row.imageUrl === null ? {} : { imageUrl: row.imageUrl }),
    ...(variant === undefined ? {} : { variant }),
    qty: row.qty,
    unitPrice,
    lineTotal: roundMoney(unitPrice * row.qty),
  };
}

function toEventDto(row: OrderEvent): OrderEventDto {
  return {
    status: row.status,
    ...(row.note === null ? {} : { note: row.note }),
    createdAt: row.createdAt.toISOString(),
  };
}

/** Maps rows to the storefront `Order` shape (02-architecture section 7). */
export function toOrderDto(
  order: Order,
  items: OrderItem[],
  events: OrderEvent[],
): OrderDto {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    customer: {
      name: order.customerName,
      phone: order.phone,
      ...(order.email === null ? {} : { email: order.email }),
    },
    address: order.address,
    deliveryOptionId: order.deliveryOptionId,
    paymentMethod: FROM_DB_PAYMENT_METHOD[order.paymentMethod],
    paymentStatus: order.paymentStatus,
    ...(order.paymentProofUrl === null ? {} : { paymentProofUrl: order.paymentProofUrl }),
    items: items.map(toItemDto),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shipping),
    discount: Number(order.discount),
    total: Number(order.total),
    ...(order.couponCode === null ? {} : { couponCode: order.couponCode }),
    ...(order.trackingNumber === null ? {} : { trackingNumber: order.trackingNumber }),
    ...(order.courier === null ? {} : { courier: order.courier }),
    ...(order.internalNote === null ? {} : { internalNote: order.internalNote }),
    createdAt: order.createdAt.toISOString(),
    estimatedDelivery: addDays(
      order.createdAt,
      DELIVERY_MAX_DAYS[order.deliveryOptionId],
    ).toISOString(),
    timeline: events.map(toEventDto),
  };
}
