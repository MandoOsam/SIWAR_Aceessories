import type { OrderState } from "@/types/orders.js";

/**
 * Allowed admin status moves (D-083). The linear path is
 * `pending → confirmed → processing → shipped → out_for_delivery → delivered`;
 * the only exits are `cancelled` (before processing) and `returned → refunded`
 * after delivery. Anything else is a 409 instead of a silent rewrite.
 */
export const ORDER_TRANSITIONS: Record<OrderState, readonly OrderState[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: ["returned"],
  returned: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransition(from: OrderState, to: OrderState): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}
