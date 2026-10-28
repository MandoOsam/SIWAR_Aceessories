import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { validateBody, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./notification.controller.js";
import {
  markNotificationsReadSchema,
  notificationListQuerySchema,
} from "./schema.js";

const router = Router();

router.get(
  "/account/notifications",
  authGuard({ kind: "customer" }),
  validateQuery(notificationListQuerySchema),
  controller.listNotifications,
);
router.patch(
  "/account/notifications/read",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateBody(markNotificationsReadSchema),
  controller.markNotificationsRead,
);

export const accountNotificationsRouter = router;
