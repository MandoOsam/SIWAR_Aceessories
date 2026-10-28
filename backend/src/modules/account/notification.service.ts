import { db } from "@/db/client.js";
import { notifications } from "@/db/schema/notifications.js";
import {
  ADMIN_NOTIFICATION_TARGET,
  type NotificationPayload,
  type NotificationType,
} from "@/types/notifications.js";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";

export async function createNotification(
  target: string,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  await db.insert(notifications).values({
    target,
    type,
    payload,
  });
}

export async function createAdminNotification(
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  await createNotification(ADMIN_NOTIFICATION_TARGET, type, payload);
}

export async function listForTarget(
  target: string,
  opts: { unread?: boolean; page: number; limit: number },
): Promise<{ data: Array<{
  id: string;
  type: NotificationType;
  title: NotificationPayload["title"];
  body: NotificationPayload["body"];
  isRead: boolean;
  createdAt: Date;
  href?: string;
}>; total: number; page: number; limit: number }> {
  const conditions = [eq(notifications.target, target)];
  if (opts.unread) {
    conditions.push(isNull(notifications.readAt));
  }
  const where = and(...conditions);
  const offset = (opts.page - 1) * opts.limit;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(opts.limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(notifications).where(where),
  ]);

  return {
    data: rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.payload.title,
      body: row.payload.body,
      isRead: row.readAt !== null,
      createdAt: row.createdAt,
      ...(row.payload.href === undefined ? {} : { href: row.payload.href }),
    })),
    total: countRows[0]?.total ?? 0,
    page: opts.page,
    limit: opts.limit,
  };
}

export async function markRead(
  target: string,
  ids?: string[],
): Promise<{ updated: number }> {
  const now = new Date();
  if (ids !== undefined && ids.length === 0) {
    return { updated: 0 };
  }
  if (ids === undefined) {
    const result = await db
      .update(notifications)
      .set({ readAt: now, updatedAt: now })
      .where(and(eq(notifications.target, target), isNull(notifications.readAt)));
    return { updated: result.rowCount ?? 0 };
  }
  const result = await db
    .update(notifications)
    .set({ readAt: now, updatedAt: now })
    .where(
      and(
        eq(notifications.target, target),
        inArray(notifications.id, ids),
        isNull(notifications.readAt),
      ),
    );
  return { updated: result.rowCount ?? 0 };
}