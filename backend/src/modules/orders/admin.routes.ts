import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { requirePermission } from "@/middlewares/requireRole.js";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./admin.controller.js";
import {
  adminOrderListQuerySchema,
  orderIdParamSchema,
  updateOrderPaymentSchema,
  updateOrderStatusSchema,
} from "./schema.js";

/**
 * Admin order management (02-architecture section 7). Support staff may read
 * and move orders; the payment confirmation is a separate action because v1
 * has no gateway (D-007). Every mutation is CSRF-checked.
 */
const readAccess = [authGuard({ kind: "admin" }), requirePermission("orders:read")];
const writeAccess = [
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("orders:write"),
];

export const adminOrdersRouter = Router();

adminOrdersRouter.get(
  "/admin/orders",
  ...readAccess,
  validateQuery(adminOrderListQuerySchema),
  controller.listOrders,
);
adminOrdersRouter.get(
  "/admin/orders/:id",
  ...readAccess,
  validateParams(orderIdParamSchema),
  controller.getOrder,
);
adminOrdersRouter.patch(
  "/admin/orders/:id/status",
  ...writeAccess,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderStatusSchema),
  controller.updateStatus,
);
adminOrdersRouter.patch(
  "/admin/orders/:id/payment",
  ...writeAccess,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderPaymentSchema),
  controller.updatePayment,
);
