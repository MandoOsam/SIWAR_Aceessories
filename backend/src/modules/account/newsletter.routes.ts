import { Router } from "express";

import { csrfProtection } from "@/middlewares/csrf.js";
import { validateBody } from "@/middlewares/validate.js";
import * as controller from "./newsletter.controller.js";
import { newsletterSchema } from "./schema.js";

export const newsletterRouter = Router();

newsletterRouter.post(
  "/newsletter",
  csrfProtection,
  validateBody(newsletterSchema),
  controller.subscribe,
);
