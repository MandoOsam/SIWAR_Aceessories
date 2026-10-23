import type { RequestHandler } from "express";

import { roleHasPermission, type Permission } from "@/config/permissions.js";
import type { UserRole } from "@/db/schema/users.js";
import { AppError } from "@/middlewares/errorHandler.js";

/** 403 unless the authenticated user's role is one of `roles`. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("UNAUTHORIZED", 401, "Authentication required"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError("FORBIDDEN", 403, "You do not have permission to do this"));
      return;
    }
    next();
  };
}

/**
 * 403 unless the authenticated user's role holds at least one of the given
 * permissions in the permission map (02-architecture §5). The map lives in
 * `src/config/permissions.ts` and is mirrored in the admin app.
 */
export function requirePermission(...permissions: Permission[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("UNAUTHORIZED", 401, "Authentication required"));
      return;
    }
    const allowed = permissions.some((permission) =>
      roleHasPermission(req.user!.role, permission),
    );
    if (!allowed) {
      next(new AppError("FORBIDDEN", 403, "You do not have permission to do this"));
      return;
    }
    next();
  };
}
