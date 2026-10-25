import type { Request, Response } from "express";

import * as contentService from "./service.js";
import type { PageSlugParams } from "./schema.js";

export async function getHome(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await contentService.getHomeContent() });
}

export async function listPages(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await contentService.listPages() });
}

export async function getPage(req: Request, res: Response): Promise<void> {
  const { slug } = req.validatedParams as PageSlugParams;
  // Null (not 404): `getStaticPage` in the storefront is typed `StaticPage | null`.
  res.status(200).json({ data: await contentService.getPageBySlug(slug) });
}

export async function getSettings(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await contentService.getPublicSettings() });
}
