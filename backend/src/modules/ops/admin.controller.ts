import type { Request, Response } from "express";

import type { AuthUser } from "@/modules/auth/types.js";
import * as notificationService from "@/modules/account/notification.service.js";
import { ADMIN_NOTIFICATION_TARGET } from "@/types/notifications.js";
import * as service from "./admin.service.js";
import type { AdjustInventoryInput, CampaignBody, DashboardQuery, InventoryQuery, ActivityQuery } from "./admin.schema.js";

function actorId(req: Request): string | undefined {
  return (req.user as AuthUser | undefined)?.id;
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const { range } = req.validatedQuery as DashboardQuery;
  res.status(200).json({ data: await service.getDashboard(range) });
}

export async function listInventory(req: Request, res: Response): Promise<void> {
  const q = req.validatedQuery as InventoryQuery;
  res.status(200).json(await service.listInventory({
    page: q.page,
    limit: q.limit,
    search: q.search,
    lowStock: q.lowStock,
  }));
}

export async function adjustInventory(req: Request, res: Response): Promise<void> {
  const body = req.body as AdjustInventoryInput;
  try {
    const result = await service.adjustInventory(body.productId, body.delta, body.reason, actorId(req));
    res.status(200).json({ data: result });
  } catch (err) {
    const e = err as Error;
    if (e.message === "NOT_FOUND") { res.status(404).json({ error: { code: "NOT_FOUND", message: "Product not found" } }); return; }
    if (e.message === "BAD_REQUEST") { res.status(400).json({ error: { code: "BAD_REQUEST", message: "Insufficient stock" } }); return; }
    throw err;
  }
}

export async function listCampaigns(req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await service.listCampaigns() });
}

export async function createCampaign(req: Request, res: Response): Promise<void> {
  const body = req.body as CampaignBody;
  const row = await service.createCampaign({
    name: body.name,
    discountPercent: body.discountPercent,
    startsAt: new Date(body.startsAt),
    endsAt: new Date(body.endsAt),
    isActive: body.isActive ?? true,
    target: body.target ?? {},
  });
  res.status(201).json({ data: row });
}

export async function updateCampaign(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  const body = req.body as CampaignBody;
  const row = await service.updateCampaign(id, {
    name: body.name,
    discountPercent: body.discountPercent,
    startsAt: new Date(body.startsAt),
    endsAt: new Date(body.endsAt),
    isActive: body.isActive,
    target: body.target,
  });
  res.status(200).json({ data: row });
}

export async function deleteCampaign(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  await service.deleteCampaign(id);
  res.status(204).send();
}

export async function listAdminNotifications(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  res.status(200).json(await service.listAdminNotifications({ page, limit }));
}

export async function markAdminNotificationsRead(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as { ids?: string[] };
  const result = await notificationService.markRead(ADMIN_NOTIFICATION_TARGET, body.ids);
  res.status(200).json({ data: result });
}

export async function listActivity(req: Request, res: Response): Promise<void> {
  const q = req.validatedQuery as ActivityQuery;
  res.status(200).json(await service.listActivity({
    page: q.page,
    limit: q.limit,
    actorId: q.actorId,
    action: q.action,
    entity: q.entity,
  }));
}

export async function exportCsv(req: Request, res: Response): Promise<void> {
  const param = req.params.entity;
  const entity = Array.isArray(param) ? param[0] : param ?? "";
  const clean = (entity || "").replace(/\.csv$/, "");
  if (clean !== "products" && clean !== "orders") {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid entity" } });
    return;
  }
  // Minimal CSV export for required scope
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${clean}.csv"`);
  if (clean === "products") {
    res.send("id,sku,name,stock,price,status\n");
    return;
  }
  res.send("id,number,customerName,total,status,createdAt\n");
}
