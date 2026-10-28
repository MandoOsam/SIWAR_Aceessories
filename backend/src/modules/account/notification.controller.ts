import type { Request, Response } from "express";

import type { AuthUser } from "@/modules/auth/types.js";
import * as service from "./notification.service.js";
import type { MarkNotificationsReadBody, NotificationListQuery } from "./schema.js";

function userId(req: Request): string {
  return (req.user as AuthUser).id;
}

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as NotificationListQuery;
  const result = await service.listForTarget(userId(req), {
    unread: query.unread,
    page: query.page,
    limit: query.limit,
  });
  res.status(200).json({
    data: result.data.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      isRead: row.isRead,
      createdAt: row.createdAt.toISOString(),
      ...(row.href === undefined ? {} : { href: row.href }),
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

export async function markNotificationsRead(req: Request, res: Response): Promise<void> {
  const body = req.body as MarkNotificationsReadBody;
  await service.markRead(userId(req), body.ids);
  res.status(204).end();
}
