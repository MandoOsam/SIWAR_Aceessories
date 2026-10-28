import type { UserRole } from "@/db/schema/users.js";

/**
 * Permission map — the source of truth for what each role may do.
 * Mirrored in `admin/src/config/permissions.ts` (02-architecture §5).
 * B2 only exercises `customers` vs `staff`; the granular permissions are
 * consumed by later phases as their routes land.
 */
export const PERMISSIONS = {
  "products:write": ["super_admin", "manager", "content"],
  "products:read": ["super_admin", "manager", "support", "content"],
  "orders:write": ["super_admin", "manager", "support"],
  "orders:read": ["super_admin", "manager", "support"],
  "reviews:write": ["super_admin", "manager", "content"],
  "reviews:read": ["super_admin", "manager", "support", "content"],
  "customers:read": ["super_admin", "manager", "support"],
  "settings:write": ["super_admin", "manager"],
  "content:write": ["super_admin", "manager", "content"],
  "users:manage": ["super_admin"],
  "analytics:read": ["super_admin", "manager"],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export const STAFF_ROLES: readonly UserRole[] = [
  "super_admin",
  "manager",
  "support",
  "content",
];

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}
