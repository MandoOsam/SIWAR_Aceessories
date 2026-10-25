import type { Request, Response } from "express";

import * as adminService from "./admin.service.js";
import type {
  AdminBlockParams,
  AdminPageParams,
  ContentBlockBody,
  PageBody,
  UpdateSettingsInput,
} from "./admin.schema.js";

export async function listBlocks(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await adminService.listBlocks() });
}

export async function getBlock(req: Request, res: Response): Promise<void> {
  const { key } = req.validatedParams as AdminBlockParams;
  res.status(200).json({ data: await adminService.getBlock(key) });
}

export async function putBlock(req: Request, res: Response): Promise<void> {
  const { key } = req.validatedParams as AdminBlockParams;
  const { block, created } = await adminService.putBlock(key, req.body as ContentBlockBody);
  res.status(created ? 201 : 200).json({ data: block });
}

export async function deleteBlock(req: Request, res: Response): Promise<void> {
  const { key } = req.validatedParams as AdminBlockParams;
  await adminService.deleteBlock(key);
  res.status(204).send();
}

export async function listPages(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await adminService.listPages() });
}

export async function getPage(req: Request, res: Response): Promise<void> {
  const { slug } = req.validatedParams as AdminPageParams;
  res.status(200).json({ data: await adminService.getPage(slug) });
}

export async function putPage(req: Request, res: Response): Promise<void> {
  const { slug } = req.validatedParams as AdminPageParams;
  const { page, created } = await adminService.putPage(slug, req.body as PageBody);
  res.status(created ? 201 : 200).json({ data: page });
}

export async function deletePage(req: Request, res: Response): Promise<void> {
  const { slug } = req.validatedParams as AdminPageParams;
  await adminService.deletePage(slug);
  res.status(204).send();
}

export async function getSettings(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await adminService.getSettings() });
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await adminService.updateSettings(req.body as UpdateSettingsInput) });
}
