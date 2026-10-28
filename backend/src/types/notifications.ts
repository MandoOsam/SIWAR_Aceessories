import type { L10n } from "@/types/l10n.js";
import type { OrderState } from "@/types/orders.js";

export const NOTIFICATION_TYPES = ["order", "promo", "system"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** The staff inbox shares one `target` value; customer targets are user ids. */
export const ADMIN_NOTIFICATION_TARGET = "admin";

export type NotificationPayload = {
  title: L10n;
  body: L10n;
  href?: string;
};

/** Customer/admin notification shape (`Notification` in the frontend types). */
export type NotificationDto = {
  id: string;
  type: NotificationType;
  title: L10n;
  body: L10n;
  isRead: boolean;
  createdAt: string;
  href?: string;
};

const ORDER_STATUS_LABELS: Record<OrderState, L10n> = {
  pending: { ar: "قيد المراجعة", en: "Pending" },
  confirmed: { ar: "مؤكد", en: "Confirmed" },
  processing: { ar: "قيد التحضير", en: "Processing" },
  shipped: { ar: "تم الشحن", en: "Shipped" },
  out_for_delivery: { ar: "في الطريق إليك", en: "Out for delivery" },
  delivered: { ar: "تم التوصيل", en: "Delivered" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
  returned: { ar: "مرتجع", en: "Returned" },
  refunded: { ar: "تم استرداد المبلغ", en: "Refunded" },
};

export function orderStatusLabel(status: OrderState): L10n {
  return ORDER_STATUS_LABELS[status];
}

export function orderCreatedPayload(
  order: { id: string; number: string },
  total: number,
): NotificationPayload {
  return {
    title: {
      ar: `تم استلام طلبك ${order.number}`,
      en: `Order ${order.number} received`,
    },
    body: {
      ar: `شكرًا لك. إجمالي طلبك ${String(total)} جنيه، وسنخبرك عند تحديث حالته.`,
      en: `Thank you. Your total is EGP ${String(total)}; we will update you when the status changes.`,
    },
    href: `/account/orders/${order.id}`,
  };
}

export function orderStatusPayload(
  order: { id: string; number: string },
  status: OrderState,
): NotificationPayload {
  const label = orderStatusLabel(status);
  return {
    title: {
      ar: `تحديث حالة الطلب ${order.number}`,
      en: `Order ${order.number} updated`,
    },
    body: {
      ar: `حالة طلبك الآن: ${label.ar}.`,
      en: `Your order is now ${label.en}.`,
    },
    href: `/account/orders/${order.id}`,
  };
}

export function newOrderAdminPayload(
  order: { id: string; number: string },
  total: number,
): NotificationPayload {
  return {
    title: {
      ar: `طلب جديد ${order.number}`,
      en: `New order ${order.number}`,
    },
    body: {
      ar: `تم إنشاء طلب جديد بإجمالي ${String(total)} جنيه.`,
      en: `A new order was placed with a total of EGP ${String(total)}.`,
    },
    href: `/orders/${order.id}`,
  };
}
