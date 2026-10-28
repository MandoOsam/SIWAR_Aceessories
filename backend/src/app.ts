import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { env } from "@/config/env.js";
import { cookieParserMiddleware } from "@/lib/cookies.js";
import { logger } from "@/lib/logger.js";
import { errorHandler } from "@/middlewares/errorHandler.js";
import { adminAuthRouter } from "@/modules/auth/admin.routes.js";
import { authRouter } from "@/modules/auth/routes.js";
import { accountAddressesRouter } from "@/modules/account/addresses.routes.js";
import { accountNotificationsRouter } from "@/modules/account/notifications.routes.js";
import { accountWishlistRouter } from "@/modules/account/wishlist.routes.js";
import { adminCatalogRouter } from "@/modules/catalog/admin.routes.js";
import { catalogRouter } from "@/modules/catalog/routes.js";
import { adminContentRouter } from "@/modules/content/admin.routes.js";
import { contentRouter } from "@/modules/content/routes.js";
import { healthRouter } from "@/modules/health/routes.js";
import { adminOrdersRouter } from "@/modules/orders/admin.routes.js";
import { ordersRouter } from "@/modules/orders/routes.js";
import { adminReviewsRouter } from "@/modules/reviews/admin.routes.js";
import { reviewsRouter } from "@/modules/reviews/routes.js";
import { adminUploadsRouter } from "@/modules/uploads/routes.js";

export const apiPrefix = "/api/v1";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_ORIGIN, env.ADMIN_ORIGIN],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParserMiddleware());
  app.use(pinoHttp({ logger }));

  app.use(apiPrefix, healthRouter);
  app.use(apiPrefix, authRouter);
  app.use(apiPrefix, adminAuthRouter);
  app.use(apiPrefix, adminCatalogRouter);
  app.use(apiPrefix, adminContentRouter);
  app.use(apiPrefix, adminOrdersRouter);
  app.use(apiPrefix, adminReviewsRouter);
  app.use(apiPrefix, adminUploadsRouter);
  app.use(apiPrefix, accountAddressesRouter);
  app.use(apiPrefix, accountWishlistRouter);
  app.use(apiPrefix, accountNotificationsRouter);
  app.use(apiPrefix, catalogRouter);
  app.use(apiPrefix, contentRouter);
  app.use(apiPrefix, ordersRouter);
  app.use(apiPrefix, reviewsRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Route not found", details: [] },
    });
  });

  app.use(errorHandler);

  return app;
}
