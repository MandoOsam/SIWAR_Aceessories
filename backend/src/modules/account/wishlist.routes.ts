import { Router } from "express";

import { authGuard } from "@/middlewares/auth.js";
import { csrfProtection } from "@/middlewares/csrf.js";
import { validateBody, validateParams } from "@/middlewares/validate.js";
import * as controller from "./wishlist.controller.js";
import { wishlistBodySchema, wishlistProductParamSchema } from "./schema.js";

const router = Router();

router.get("/account/wishlist", authGuard({ kind: "customer" }), controller.listWishlist);
router.post(
  "/account/wishlist",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateBody(wishlistBodySchema),
  controller.addToWishlist,
);
router.delete(
  "/account/wishlist/:productId",
  authGuard({ kind: "customer" }),
  csrfProtection,
  validateParams(wishlistProductParamSchema),
  controller.removeFromWishlist,
);

export const accountWishlistRouter = router;
