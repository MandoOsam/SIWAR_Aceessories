import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { requirePermission } from "@/middlewares/requireRole.js";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./admin.controller.js";
import {
  activityQuerySchema,
  adjustInventorySchema,
  campaignBodySchema,
  campaignIdParamSchema,
  dashboardQuerySchema,
  inventoryQuerySchema,
} from "./admin.schema.js";

const readAccess = [authGuard({ kind: "admin" }), requirePermission("analytics:read")];

const inventoryWrite = [
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("inventory:write"),
];

const campaignWrite = [
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("campaigns:write"),
];

export const adminOpsRouter = Router();

adminOpsRouter.get("/admin/dashboard", ...readAccess, validateQuery(dashboardQuerySchema), controller.getDashboard);
adminOpsRouter.get("/admin/inventory", ...readAccess, validateQuery(inventoryQuerySchema), controller.listInventory);
adminOpsRouter.post("/admin/inventory/adjust", ...inventoryWrite, validateBody(adjustInventorySchema), controller.adjustInventory);
adminOpsRouter.get("/admin/campaigns", ...readAccess, controller.listCampaigns);
adminOpsRouter.post("/admin/campaigns", ...campaignWrite, validateBody(campaignBodySchema), controller.createCampaign);
adminOpsRouter.patch("/admin/campaigns/:id", ...campaignWrite, validateParams(campaignIdParamSchema), validateBody(campaignBodySchema), controller.updateCampaign);
adminOpsRouter.delete("/admin/campaigns/:id", ...campaignWrite, validateParams(campaignIdParamSchema), controller.deleteCampaign);
adminOpsRouter.get("/admin/notifications", ...readAccess, controller.listAdminNotifications);
adminOpsRouter.patch("/admin/notifications/read", csrfProtection, authGuard({ kind: "admin" }), controller.markAdminNotificationsRead);
adminOpsRouter.get("/admin/activity", ...readAccess, validateQuery(activityQuerySchema), controller.listActivity);
adminOpsRouter.get("/admin/export/:entity.csv", ...readAccess, controller.exportCsv);
