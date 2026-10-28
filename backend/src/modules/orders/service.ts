import { db } from "@/db/client.js";
import type { NewOrderItem } from "@/db/schema/orderItems.js";
import { AppError } from "@/middlewares/errorHandler.js";
import type { ShippingSettings } from "@/types/content.js";
import {
  DELIVERY_OPTION_IDS,
  TO_DB_PAYMENT_METHOD,
  type DeliveryOptionId,
  type OrderDto,
  type OrderResult,
  type OrderVariant,
} from "@/types/orders.js";
import * as couponRepo from "./coupon.repository.js";
import * as couponService from "./coupon.service.js";
import { toOrderDto } from "./mapper.js";
import { money, roundMoney } from "./money.js";
import * as repo from "./repository.js";
import type { CreateOrderInput, TrackOrderQuery } from "./schema.js";

type RequestedLine = {
  productId: string;
  variant: OrderVariant;
  qty: number;
  index: number;
};

function orderError(message: string, path: string): AppError {
  return new AppError("UNPROCESSABLE_ENTITY", 422, message, [{ path, message }]);
}

/**
 * Merges repeated product/variant lines so one cart line cannot dodge the
 * stock check by being sent twice.
 */
function mergeLines(items: CreateOrderInput["items"]): RequestedLine[] {
  const merged = new Map<string, RequestedLine>();
  items.forEach((line, index) => {
    const key = `${line.productId}|${line.variant.color ?? ""}|${line.variant.size ?? ""}`;
    const existing = merged.get(key);
    if (existing === undefined) {
      merged.set(key, { ...line, index });
    } else {
      existing.qty += line.qty;
    }
  });
  return [...merged.values()];
}

function normalizeVariant(line: CreateOrderInput["items"][number]): OrderVariant {
  const variant: OrderVariant = {};
  if (line.variant.color !== undefined) variant.color = line.variant.color;
  if (line.variant.size !== undefined) variant.size = line.variant.size;
  return variant;
}

/** Standard honours `freeAbove`; express always charges its fee (D-080). */
function resolveShipping(
  shipping: ShippingSettings,
  option: DeliveryOptionId,
  subtotal: number,
): number {
  if (!DELIVERY_OPTION_IDS.includes(option)) {
    throw orderError("Unknown delivery option", "deliveryOptionId");
  }
  if (option === "express") {
    return roundMoney(shipping.expressFee ?? shipping.defaultFee);
  }
  if (shipping.freeAbove !== undefined && subtotal >= shipping.freeAbove) return 0;
  return roundMoney(shipping.defaultFee);
}

function assertPaymentMethod(settings: { paymentMethods: { id: string; isEnabled: boolean }[] }, id: string): void {
  const method = settings.paymentMethods.find((entry) => entry.id === id);
  if (method === undefined || !method.isEnabled) {
    throw orderError("Payment method is not available", "paymentMethod");
  }
}

/**
 * `POST /orders` (03-code-standards section 4): recomputes every amount from
 * the database, locks stock and the coupon row, then writes the order, lines,
 * stock decrement, coupon usage and the first timeline event in one transaction.
 */
export async function createOrder(
  input: CreateOrderInput,
  userId?: string,
): Promise<OrderResult> {
  const settings = await repo.findSettings();
  if (settings === undefined) {
    throw new AppError("INTERNAL_ERROR", 500, "Store settings are not configured");
  }
  assertPaymentMethod(settings, input.paymentMethod);

  return db.transaction(async (tx) => {
    const requested = mergeLines(input.items);
    const productIds = [...new Set(requested.map((line) => line.productId))];
    const productRows = await repo.findProductsForUpdate(tx, productIds);
    const products = new Map(productRows.map((product) => [product.id, product]));
    const images = await repo.findPrimaryImages(tx, productIds);

    let subtotal = 0;
    const lineItems: NewOrderItem[] = [];
    for (const line of requested) {
      const product = products.get(line.productId);
      if (product === undefined) {
        throw orderError("Product not found", `items.${line.index}.productId`);
      }
      if (product.status !== "active") {
        throw orderError("Product is not available", `items.${line.index}.productId`);
      }
      if (line.variant.color !== undefined && !product.colors.includes(line.variant.color)) {
        throw orderError("Invalid colour for this product", `items.${line.index}.variant.color`);
      }
      if (line.variant.size !== undefined && !product.sizes.includes(line.variant.size)) {
        throw orderError("Invalid size for this product", `items.${line.index}.variant.size`);
      }
      if (product.stock < line.qty) {
        throw orderError(
          `Only ${product.stock} left in stock`,
          `items.${line.index}.qty`,
        );
      }

      const unitPrice = Number(product.price);
      subtotal += unitPrice * line.qty;
      const imageUrl = images.get(product.id);
      lineItems.push({
        orderId: "",
        productId: product.id,
        nameSnapshot: product.name,
        imageUrl: imageUrl ?? null,
        variant: normalizeVariant(line),
        qty: line.qty,
        unitPrice: money(unitPrice),
      });
    }
    subtotal = roundMoney(subtotal);

    let shippingFee = resolveShipping(settings.shipping, input.deliveryOptionId, subtotal);
    let discount = 0;
    let appliedCoupon: { id: string; code: string } | null = null;
    if (input.couponCode !== undefined && input.couponCode !== "") {
      const resolved = await couponService.resolveCouponForCheckout(tx, input.couponCode, subtotal);
      discount = resolved.validation.discount;
      if (resolved.validation.freeShipping === true) shippingFee = 0;
      appliedCoupon = { id: resolved.coupon.id, code: resolved.coupon.code };
    }

    const total = roundMoney(Math.max(0, subtotal + shippingFee - discount));
    const number = await repo.allocateOrderNumber(tx);

    const order = await repo.insertOrder(tx, {
      number,
      ...(userId === undefined ? {} : { userId }),
      customerName: input.customer.name,
      phone: input.customer.phone,
      ...(input.customer.email === undefined ? {} : { email: input.customer.email }),
      address: input.address,
      deliveryOptionId: input.deliveryOptionId,
      subtotal: money(subtotal),
      shipping: money(shippingFee),
      discount: money(discount),
      total: money(total),
      ...(appliedCoupon === null ? {} : { couponCode: appliedCoupon.code }),
      paymentMethod: TO_DB_PAYMENT_METHOD[input.paymentMethod],
      ...(input.paymentProofUrl === undefined
        ? {}
        : { paymentProofUrl: input.paymentProofUrl }),
      status: "pending",
      paymentStatus: "unpaid",
    });

    await repo.insertOrderItems(
      tx,
      lineItems.map((item) => ({ ...item, orderId: order.id })),
    );

    for (const line of requested) {
      const updated = await repo.decrementStock(tx, line.productId, line.qty);
      if (updated.length === 0) {
        throw new AppError("CONFLICT", 409, "Stock changed during checkout, please retry");
      }
    }

    if (appliedCoupon !== null) {
      await couponRepo.incrementCouponUsage(tx, appliedCoupon.id);
    }

    await repo.insertOrderEvent(tx, {
      orderId: order.id,
      status: "pending",
      note: "Order created",
    });

    try {
      const { createAdminNotification, createNotification } =
        await import("@/modules/account/notification.service.js");
      const { newOrderAdminPayload, orderCreatedPayload } =
        await import("@/types/notifications.js");
      const totalNum = Number(order.total);
      await createAdminNotification("order", newOrderAdminPayload({ id: order.id, number: order.number }, totalNum));
      if (userId !== undefined) {
        await createNotification(userId, "order", orderCreatedPayload({ id: order.id, number: order.number }, totalNum));
      }
    } catch {
      /* notifications are best-effort; checkout must not fail */
    }

    return { id: order.id, number: order.number, total: Number(order.total) };
  });
}

async function loadOrderDto(orderId: string): Promise<OrderDto | null> {
  const order = await repo.findOrderById(orderId);
  if (order === undefined) return null;
  const [items, events] = await Promise.all([
    repo.findOrderItems([order.id]),
    repo.findOrderEvents([order.id]),
  ]);
  return toOrderDto(order, items, events);
}

/** `GET /orders/:id` for the success page; null (200) when unknown. */
export async function getOrderById(id: string): Promise<OrderDto | null> {
  return loadOrderDto(id);
}

/** `GET /orders/track`: number + phone must match; unknown pairs answer null (200). */
export async function trackOrder(input: TrackOrderQuery): Promise<OrderDto | null> {
  const order = await repo.findOrderByNumberAndPhone(input.number, input.phone);
  if (order === undefined) return null;
  const [items, events] = await Promise.all([
    repo.findOrderItems([order.id]),
    repo.findOrderEvents([order.id]),
  ]);
  return toOrderDto(order, items, events);
}

import { and, eq } from "drizzle-orm";
import { orders } from "@/db/schema/orders.js";

function notFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Order not found");
}

export async function listMyOrders(
  userId: string,
  page: number,
  limit: number,
): Promise<{ data: OrderDto[]; total: number; page: number; limit: number }> {
  const { rows, total } = await repo.listOrdersForUser(userId, page, limit);
  const data = await Promise.all(
    rows.map(async (order) => {
      const [items, events] = await Promise.all([
        repo.findOrderItems([order.id]),
        repo.findOrderEvents([order.id]),
      ]);
      return toOrderDto(order, items, events);
    }),
  );
  return { data, total, page, limit };
}

export async function getMyOrder(userId: string, id: string): Promise<OrderDto> {
  const order = await repo.findOrderByIdForUser(id, userId);
  if (order === undefined) throw notFound();
  const [items, events] = await Promise.all([
    repo.findOrderItems([order.id]),
    repo.findOrderEvents([order.id]),
  ]);
  return toOrderDto(order, items, events);
}

export async function cancelMyOrder(userId: string, id: string): Promise<OrderDto> {
  return db.transaction(async (tx) => {
    const orderRows = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, userId)))
      .limit(1)
      .for("update");
    const o = orderRows[0];
    if (!o) throw notFound();
    if (o.status !== "pending" && o.status !== "confirmed") {
      throw new AppError("CONFLICT", 409, "This order cannot be cancelled");
    }
    await repo.updateOrderStatus(tx, id, "cancelled");
    if (o.couponCode) {
      try {
        await repo.decrementCouponUsageForOrder(tx, o.couponCode);
      } catch {
        /* best effort */
      }
    }
    const items = await repo.findOrderItems([id]);
    for (const item of items) {
      const pid = (item as { productId?: string | null }).productId;
      const qty = (item as { qty: number }).qty;
      if (pid) {
        try {
          await repo.incrementProductStock(tx, pid, qty);
        } catch {
          /* best effort */
        }
      }
    }
    await repo.insertOrderEvent(tx, { orderId: id, status: "cancelled", note: "Cancelled by customer" });
    const refreshed = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
    const ord = refreshed[0];
    if (!ord) throw notFound();
    const [its, evs] = await Promise.all([repo.findOrderItems([id]), repo.findOrderEvents([id])]);
    return toOrderDto(ord, its, evs);
  });
}

export async function requestReturn(userId: string, id: string): Promise<OrderDto> {
  return db.transaction(async (tx) => {
    const orderRows = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, userId)))
      .limit(1)
      .for("update");
    const o = orderRows[0];
    if (!o) throw notFound();
    if (o.status !== "delivered") {
      throw new AppError("CONFLICT", 409, "Only delivered orders can be returned");
    }
    await repo.updateOrderStatus(tx, id, "returned");
    await repo.insertOrderEvent(tx, { orderId: id, status: "returned", note: "Return requested by customer" });
    const refreshed = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
    const ord = refreshed[0];
    if (!ord) throw notFound();
    const [its, evs] = await Promise.all([repo.findOrderItems([id]), repo.findOrderEvents([id])]);
    return toOrderDto(ord, its, evs);
  });
}