import { db } from "@/db/client.js";
import type { OrderEvent } from "@/db/schema/orderEvents.js";
import type { OrderItem } from "@/db/schema/orderItems.js";
import type { Order } from "@/db/schema/orders.js";
import { AppError } from "@/middlewares/errorHandler.js";
import type { OrderDto } from "@/types/orders.js";
import { toOrderDto } from "./mapper.js";
import * as repo from "./repository.js";
import { canTransition, ORDER_TRANSITIONS } from "./transitions.js";
import type {
  AdminOrderListQuery,
  UpdateOrderPaymentInput,
  UpdateOrderStatusInput,
} from "./schema.js";

function notFound(): AppError {
  return new AppError("NOT_FOUND", 404, "Order not found");
}

async function toDtos(rows: Order[], includeEvents: boolean): Promise<OrderDto[]> {
  if (rows.length === 0) return [];
  const orderIds = rows.map((row) => row.id);
  const [items, events] = await Promise.all([
    repo.findOrderItems(orderIds),
    includeEvents ? repo.findOrderEvents(orderIds) : Promise.resolve([]),
  ]);

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const item of items) {
    const list = itemsByOrder.get(item.orderId);
    if (list === undefined) itemsByOrder.set(item.orderId, [item]);
    else list.push(item);
  }

  const eventsByOrder = new Map<string, OrderEvent[]>();
  for (const event of events) {
    const list = eventsByOrder.get(event.orderId);
    if (list === undefined) eventsByOrder.set(event.orderId, [event]);
    else list.push(event);
  }

  return rows.map((order) =>
    toOrderDto(order, itemsByOrder.get(order.id) ?? [], eventsByOrder.get(order.id) ?? []),
  );
}

async function loadOne(id: string): Promise<OrderDto> {
  const order = await repo.findOrderById(id);
  if (order === undefined) throw notFound();
  const [dto] = await toDtos([order], true);
  if (dto === undefined) throw notFound();
  return dto;
}

export async function listOrders(input: AdminOrderListQuery): Promise<{
  data: OrderDto[];
  total: number;
  page: number;
  limit: number;
}> {
  const { rows, total } = await repo.listOrders({
    page: input.page,
    limit: input.limit,
    ...(input.status === undefined ? {} : { status: input.status }),
    ...(input.paymentStatus === undefined ? {} : { paymentStatus: input.paymentStatus }),
    ...(input.q === undefined ? {} : { search: input.q }),
  });

  return { data: await toDtos(rows, false), total, page: input.page, limit: input.limit };
}

export async function getOrder(id: string): Promise<OrderDto> {
  return loadOne(id);
}

/** Applies a status change and appends the timeline event in one transaction. */
export async function updateStatus(
  id: string,
  input: UpdateOrderStatusInput,
  actorId: string,
): Promise<OrderDto> {
  await db.transaction(async (tx) => {
    const order = await repo.findOrderForUpdate(tx, id);
    if (order === undefined) throw notFound();
    if (order.status === input.status) {
      throw new AppError("CONFLICT", 409, `Order is already ${input.status}`);
    }
    if (!canTransition(order.status, input.status)) {
      const next = ORDER_TRANSITIONS[order.status];
      throw new AppError(
        "CONFLICT",
        409,
        `Cannot move an order from ${order.status} to ${input.status}`,
        [
          {
            path: "status",
            message: next.length === 0 ? "This order is final" : `Next states: ${next.join(", ")}`,
          },
        ],
      );
    }

    await repo.updateOrderStatus(tx, id, input.status);
    await repo.insertOrderEvent(tx, {
      orderId: id,
      status: input.status,
      note: input.note ?? null,
      actorId,
    });
  });

  try {
    const order = await repo.findOrderById(id);
    if (order?.userId !== null && order?.userId !== undefined) {
      const { createNotification } = await import("@/modules/account/notification.service.js");
      const { orderStatusPayload } = await import("@/types/notifications.js");
      await createNotification(
        order.userId,
        "order",
        orderStatusPayload({ id: order.id, number: order.number }, order.status),
      );
    }
  } catch {
    /* best effort */
  }

  return loadOne(id);
}

/** Payment confirmation is manual in v1 (COD/transfer), so it is a separate action. */
export async function updatePayment(
  id: string,
  input: UpdateOrderPaymentInput,
  actorId: string,
): Promise<OrderDto> {
  await db.transaction(async (tx) => {
    const order = await repo.findOrderForUpdate(tx, id);
    if (order === undefined) throw notFound();
    if (order.paymentStatus === input.paymentStatus) return;

    await repo.updateOrderPayment(tx, id, input.paymentStatus);
    await repo.insertOrderEvent(tx, {
      orderId: id,
      status: order.status,
      note: input.note ?? `Payment marked ${input.paymentStatus}`,
      actorId,
    });
  });

  return loadOne(id);
}
