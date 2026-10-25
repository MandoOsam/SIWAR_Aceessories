import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { requirePermission } from "@/middlewares/requireRole.js";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.js";
import * as controller from "./admin.controller.js";
import {
  adminCategoryListQuerySchema,
  adminProductListQuerySchema,
  createCategorySchema,
  createProductSchema,
  idParamSchema,
  updateCategorySchema,
  updateProductSchema,
} from "./admin.schema.js";

/**
 * Admin catalogue (02-architecture section 7). Staff session + permission map;
 * reads use `products:read`, writes use `products:write` (categories are
 * catalogue content, so they share the same permission pair). Every mutation
 * goes through CSRF protection like the rest of the admin surface.
 */
const readAccess = [authGuard({ kind: "admin" }), requirePermission("products:read")];
const writeAccess = [
  csrfProtection,
  authGuard({ kind: "admin" }),
  requirePermission("products:write"),
];

export const adminCatalogRouter = Router();

adminCatalogRouter.get(
  "/admin/categories",
  ...readAccess,
  validateQuery(adminCategoryListQuerySchema),
  controller.listCategories,
);
adminCatalogRouter.post(
  "/admin/categories",
  ...writeAccess,
  validateBody(createCategorySchema),
  controller.createCategory,
);
adminCatalogRouter.patch(
  "/admin/categories/:id",
  ...writeAccess,
  validateParams(idParamSchema),
  validateBody(updateCategorySchema),
  controller.updateCategory,
);
adminCatalogRouter.delete(
  "/admin/categories/:id",
  ...writeAccess,
  validateParams(idParamSchema),
  controller.deleteCategory,
);

adminCatalogRouter.get(
  "/admin/products",
  ...readAccess,
  validateQuery(adminProductListQuerySchema),
  controller.listProducts,
);
adminCatalogRouter.get(
  "/admin/products/:id",
  ...readAccess,
  validateParams(idParamSchema),
  controller.getProduct,
);
adminCatalogRouter.post(
  "/admin/products",
  ...writeAccess,
  validateBody(createProductSchema),
  controller.createProduct,
);
adminCatalogRouter.patch(
  "/admin/products/:id",
  ...writeAccess,
  validateParams(idParamSchema),
  validateBody(updateProductSchema),
  controller.updateProduct,
);
adminCatalogRouter.delete(
  "/admin/products/:id",
  ...writeAccess,
  validateParams(idParamSchema),
  controller.deleteProduct,
);
