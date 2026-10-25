import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { requirePermission } from "@/middlewares/requireRole.js";
import { validateBody, validateParams } from "@/middlewares/validate.js";
import * as controller from "./admin.controller.js";
import {
  adminBlockParamsSchema,
  adminPageParamsSchema,
  contentBlockBodySchema,
  pageBodySchema,
  updateSettingsSchema,
} from "./admin.schema.js";

/**
 * Admin content and settings (02-architecture section 7, D-079). Content and
 * pages share `content:write`; settings need `settings:write` because they
 * change checkout behaviour (super_admin/manager only). Every mutation is
 * CSRF-checked and runs through the production admin guard.
 */
const contentRead = [authGuard({ kind: "admin" }), requirePermission("content:write")];
const contentWrite = [
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("content:write"),
];
const settingsRead = [authGuard({ kind: "admin" }), requirePermission("settings:write")];
const settingsWrite = [
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("settings:write"),
];

export const adminContentRouter = Router();

adminContentRouter.get("/admin/content", ...contentRead, controller.listBlocks);
adminContentRouter.get(
  "/admin/content/:key",
  ...contentRead,
  validateParams(adminBlockParamsSchema),
  controller.getBlock,
);
adminContentRouter.put(
  "/admin/content/:key",
  ...contentWrite,
  validateParams(adminBlockParamsSchema),
  validateBody(contentBlockBodySchema),
  controller.putBlock,
);
adminContentRouter.delete(
  "/admin/content/:key",
  ...contentWrite,
  validateParams(adminBlockParamsSchema),
  controller.deleteBlock,
);

adminContentRouter.get("/admin/pages", ...contentRead, controller.listPages);
adminContentRouter.get(
  "/admin/pages/:slug",
  ...contentRead,
  validateParams(adminPageParamsSchema),
  controller.getPage,
);
adminContentRouter.put(
  "/admin/pages/:slug",
  ...contentWrite,
  validateParams(adminPageParamsSchema),
  validateBody(pageBodySchema),
  controller.putPage,
);
adminContentRouter.delete(
  "/admin/pages/:slug",
  ...contentWrite,
  validateParams(adminPageParamsSchema),
  controller.deletePage,
);

adminContentRouter.get("/admin/settings", ...settingsRead, controller.getSettings);
adminContentRouter.patch(
  "/admin/settings",
  ...settingsWrite,
  validateBody(updateSettingsSchema),
  controller.updateSettings,
);
