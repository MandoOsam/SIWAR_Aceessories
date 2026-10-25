import { Router } from "express";

import { validateParams } from "@/middlewares/validate.js";
import * as controller from "./controller.js";
import { pageSlugParamSchema } from "./schema.js";

/**
 * Public content and settings (02-architecture section 7). No auth: the
 * storefront reads these on every page, and only published copy is exposed
 * (`is_active` blocks, enabled payment methods).
 */
export const contentRouter = Router();

contentRouter.get("/content/home", controller.getHome);
contentRouter.get("/content/pages", controller.listPages);
contentRouter.get("/content/pages/:slug", validateParams(pageSlugParamSchema), controller.getPage);
contentRouter.get("/settings/public", controller.getSettings);
