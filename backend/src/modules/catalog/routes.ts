import { Router } from "express";

import { validateParams, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./controller.js";
import { listProductsQuerySchema, slugParamSchema } from "./schema.js";

/**
 * Public catalog endpoints (02-architecture section 7). Read-only, so no CSRF
 * protection and no session: the storefront calls these before login.
 */
export const catalogRouter = Router();

catalogRouter.get("/categories", controller.listCategories);
catalogRouter.get("/categories/:slug", validateParams(slugParamSchema), controller.getCategory);

catalogRouter.get("/products", validateQuery(listProductsQuerySchema), controller.listProducts);
catalogRouter.get("/products/:slug", validateParams(slugParamSchema), controller.getProduct);
