import type { UserRole } from "@/db/schema/users.js";
import type { AuthUser } from "@/modules/auth/types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
      /** Role of the session cookie used (customer cookie vs admin cookie). */
      sessionKind?: "customer" | "admin";
      cookies?: Record<string, string>;
    }
  }
}

export type { UserRole };
