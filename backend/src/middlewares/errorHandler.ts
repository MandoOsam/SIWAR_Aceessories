import type { NextFunction, Request, Response } from "express";

import { logger } from "@/lib/logger.js";

/** Error codes used by the API contract (02-architecture §4). */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, status: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const STATUS_FALLBACK: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
};

function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (isAppError(err)) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details ?? [] },
    });
    return;
  }

  const status = 500;
  logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled error");
  res.status(status).json({
    error: {
      code: STATUS_FALLBACK[status] ?? "INTERNAL_ERROR",
      message: "Internal server error",
      details: [],
    },
  });
}
