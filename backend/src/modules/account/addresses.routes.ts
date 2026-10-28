import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { validateBody, validateParams } from "@/middlewares/validate.js";
import * as controller from "./address.controller.js";
import {
  addressBodySchema,
  addressIdParamSchema,
} from "./schema.js";

const router = Router();

router.get("/account/addresses", authGuard({ kind: "customer" }), controller.listAddresses);
router.post(
  "/account/addresses",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateBody(addressBodySchema),
  controller.createAddress,
);
router.patch(
  "/account/addresses/:id",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateParams(addressIdParamSchema),
  validateBody(addressBodySchema),
  controller.updateAddress,
);
router.delete(
  "/account/addresses/:id",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateParams(addressIdParamSchema),
  controller.deleteAddress,
);
router.patch(
  "/account/addresses/:id/default",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateParams(addressIdParamSchema),
  controller.setDefaultAddress,
);

export const accountAddressesRouter = router;
