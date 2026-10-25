import type { Request, Response } from "express";

import { AppError } from "@/middlewares/errorHandler.js";
import * as service from "./admin.service.js";
import type {
  AdminOrderListQuery,
  OrderIdParams,
  UpdateOrderPaymentInput,
  UpdateOrderStatusInput,
} from "./schema.js";

function actorId(req: Request): string {
  const id = req.user?.id;
  if (id === undefined) throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  return id;
}

export async function listOrders(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as AdminOrderListQuery;
  res.status(200).json(await service.listOrders(query));
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as OrderIdParams;
  res.status(200).json({ data: await service.getOrder(id) });
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as OrderIdParams;
  const input = req.body as UpdateOrderStatusInput;
  res.status(200).json({ data: await service.updateStatus(id, input, actorId(req)) });
}

export async function updatePayment(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as OrderIdParams;
  const input = req.body as UpdateOrderPaymentInput;
  res.status(200).json({ data: await service.updatePayment(id, input, actorId(req)) });
}
