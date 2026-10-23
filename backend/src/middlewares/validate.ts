import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { AppError } from "@/middlewares/errorHandler.js";

/**
 * Validates and replaces `req.body` with the parsed value (02-architecture §4).
 * Every mutating route runs through this; controllers never trust raw input.
 */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new AppError(
          "VALIDATION_ERROR",
          400,
          "Invalid request body",
          result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        ),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}
