import type { UserRole } from "@/db/schema/users.js";

/** Public user shape returned by the API — never includes `passwordHash`. */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  displayName: { ar: string; en: string } | null;
  phone: string | null;
  role: UserRole;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
