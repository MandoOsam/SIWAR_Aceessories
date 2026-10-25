import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { AppError } from "@/middlewares/errorHandler.js";

/** Flattens Zod issues into the API error `details` shape (02-architecture §4). */
export function issueDetails(
  issues: { path: PropertyKey[]; message: string }[],
): { path: string; message: string }[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

function validationError(message: string, issues: { path: PropertyKey[]; message: string }[]) {
  return new AppError("VALIDATION_ERROR", 400, message, issueDetails(issues));
}

/**
 * Validates and replaces `req.body` with the parsed value (02-architecture A4).
 * Every mutating route runs through this; controllers never trust raw input.
 */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(validationError("Invalid request body", result.error.issues));
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validates `req.query` and stores the parsed value on `req.validatedQuery`.
 * Express 5 exposes `req.query` as a read-only getter, so it cannot be
 * replaced in place.
 */
export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(validationError("Invalid query parameters", result.error.issues));
      return;
    }
    req.validatedQuery = result.data;
    next();
  };
}

/** Validates `req.params` (slugs, ids) and stores the parsed value on the request. */
export function validateParams<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(validationError("Invalid path parameters", result.error.issues));
      return;
    }
    req.validatedParams = result.data;
    next();
  };
}
