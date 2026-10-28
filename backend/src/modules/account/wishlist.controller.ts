import type { Request, Response } from "express";

import type { AuthUser } from "@/modules/auth/types.js";
import * as service from "./wishlist.service.js";

function userId(req: Request): string {
  return (req.user as AuthUser).id;
}

export async function listWishlist(req: Request, res: Response): Promise<void> {
  res.status(200).json(await service.listWishlist(userId(req)));
}

export async function addToWishlist(req: Request, res: Response): Promise<void> {
  const { productId } = req.body as { productId: string };
  await service.addToWishlist(userId(req), productId);
  res.status(204).end();
}

export async function removeFromWishlist(req: Request, res: Response): Promise<void> {
  const { productId } = req.validatedParams as { productId: string };
  await service.removeFromWishlist(userId(req), productId);
  res.status(204).end();
}
