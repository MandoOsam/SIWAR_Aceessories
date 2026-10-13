/**
 * Mock account seed for the auth service (mock mode only).
 *
 * The real API hashes passwords with argon2 and never sends one back (02-architecture.md §5), so
 * the `password` here exists purely so the mock login has something to check against. It lives in
 * the bundle, not in `localStorage`; accounts created at runtime keep their password in memory for
 * the session only (D-046).
 */

import type { AuthUser } from "@/services/types";

export type MockAccount = AuthUser & { password: string };

/** Demo credentials shown on the login page so the flow can be tried without registering. */
export const DEMO_EMAIL = "demo@siwar.eg";

export const DEMO_PASSWORD = "Siwar1234";

export const seedAccounts: MockAccount[] = [
  {
    id: "mock-user-demo",
    name: "SIWAR Demo",
    email: DEMO_EMAIL,
    phone: "01000000000",
    role: "customer",
    createdAt: "2026-01-01T00:00:00.000Z",
    password: DEMO_PASSWORD,
  },
];
