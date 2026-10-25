import type { Request, RequestHandler } from "express";

import {
  ADMIN_SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/config/session.js";
import { AppError } from "@/middlewares/errorHandler.js";
import { validateSession } from "@/modules/auth/service.js";
import type { SessionKind } from "@/db/schema/sessions.js";

type GuardOptions = {
  /** Which cookie to read. Defaults to the customer cookie. */
  kind?: SessionKind;
  /** When true, missing/invalid sessions pass through without error. */
  optional?: boolean;
};

function cookieNameFor(kind: SessionKind): string {
  return kind === "admin" ? ADMIN_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME;
}

export function authGuard(options: GuardOptions = {}): RequestHandler {
  const kind: SessionKind = options.kind ?? "customer";
  const cookieName = cookieNameFor(kind);

  return async (req: Request, _res, next) => {
    const sessionId = req.cookies?.[cookieName] as string | undefined;

    if (!sessionId) {
      if (options.optional) return next();
      return next(new AppError("UNAUTHORIZED", 401, "Authentication required"));
    }

    try {
      const user = await validateSession(sessionId, kind);
      if (!user) {
        if (options.optional) return next();
        return next(new AppError("UNAUTHORIZED", 401, "Invalid or expired session"));
      }
      req.user = user;
      req.sessionId = sessionId;
      req.sessionKind = kind;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
