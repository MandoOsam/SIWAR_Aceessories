import { and, eq, gt, ne } from "drizzle-orm";

import { db } from "@/db/client.js";
import { sessions } from "@/db/schema/sessions.js";
import { users } from "@/db/schema/users.js";
import type { SessionKind } from "@/db/schema/sessions.js";

/** Only this layer touches the database (03-code-standards §4). */

export function findUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export function findUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export function insertUser(values: typeof users.$inferInsert) {
  return db.insert(users).values(values).returning();
}

export function updateUser(userId: string, values: Partial<typeof users.$inferInsert>) {
  return db
    .update(users)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
}

export function touchLastLogin(userId: string) {
  return db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}

export function insertSession(values: typeof sessions.$inferInsert) {
  return db.insert(sessions).values(values).returning();
}

export function deleteSession(sessionId: string) {
  return db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function deleteOtherSessions(userId: string, keepSessionId: string) {
  const conditions = [eq(sessions.userId, userId)];
  if (keepSessionId !== "") {
    conditions.push(ne(sessions.id, keepSessionId));
  }
  return db.delete(sessions).where(and(...conditions));
}

/**
 * Returns the session row joined with its user when the session is unexpired,
 * or null. Used by `authGuard` and `getCurrentUser`.
 */
export async function findValidSession(sessionId: string): Promise<{
  kind: SessionKind;
  user: typeof users.$inferSelect;
} | null> {
  const row = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())),
    with: { user: true },
  });
  if (!row) return null;
  return { kind: row.kind, user: row.user };
}
