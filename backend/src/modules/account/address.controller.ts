import type { Request, Response } from "express";

import type { AuthUser } from "@/modules/auth/types.js";
import * as service from "./address.service.js";
import type { AddressBody } from "./schema.js";

function userId(req: Request): string {
  return (req.user as AuthUser).id;
}

export async function listAddresses(req: Request, res: Response): Promise<void> {
  res.status(200).json(await service.listAddresses(userId(req)));
}

export async function createAddress(req: Request, res: Response): Promise<void> {
  const address = await service.createAddress(userId(req), req.body as AddressBody);
  res.status(201).json({ data: address });
}

export async function updateAddress(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  const address = await service.updateAddress(userId(req), id, req.body as AddressBody);
  res.status(200).json({ data: address });
}

export async function deleteAddress(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  await service.deleteAddress(userId(req), id);
  res.status(204).end();
}

export async function setDefaultAddress(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  res.status(200).json({ data: await service.setDefaultAddress(userId(req), id) });
}
