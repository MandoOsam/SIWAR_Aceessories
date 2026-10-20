import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { env } from "@/config/env.js";
import { logger } from "@/lib/logger.js";
import { errorHandler } from "@/middlewares/errorHandler.js";
import { healthRouter } from "@/modules/health/routes.js";

export const apiPrefix = "/api/v1";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_ORIGIN, env.ADMIN_ORIGIN],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use(apiPrefix, healthRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Route not found", details: [] },
    });
  });

  app.use(errorHandler);

  return app;
}
