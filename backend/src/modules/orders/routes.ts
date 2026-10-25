import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { couponRateLimiter } from "@/middlewares/rateLimit.js";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./controller.js";
import {
  couponValidateSchema,
  createOrderSchema,
  orderIdParamSchema,
  trackOrderQuerySchema,
} from "./schema.js";

/**
 * Public checkout endpoints (02-architecture section 7). Guests may order, so
 * the session is optional (a logged-in customer's id is attached when present).
 * Mutations are CSRF-checked like the rest of the API; coupon validation is
 * rate limited to stop code enumeration (section 5).
 */
export const ordersRouter = Router();

ordersRouter.post(
  "/orders",
  csrfProtection,
  authGuard({ optional: true }),
  validateBody(createOrderSchema),
  controller.createOrder,
);
ordersRouter.post(
  "/coupons/validate",
  couponRateLimiter,
  csrfProtection,
  validateBody(couponValidateSchema),
  controller.validateCoupon,
);
ordersRouter.get("/orders/track", validateQuery(trackOrderQuerySchema), controller.trackOrder);
ordersRouter.get(
  "/orders/:id",
  validateParams(orderIdParamSchema),
  controller.getOrder,
);
