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
      /** Result of `validateQuery`; read it through the endpoint's zod schema type. */
      validatedQuery?: unknown;
      /** Result of `validateParams`; read it through the endpoint's zod schema type. */
      validatedParams?: unknown;
    }
  }
}

export type { UserRole };
