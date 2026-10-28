import type { Request, Response } from "express";

import type { AuthUser } from "@/modules/auth/types.js";
import * as couponService from "./coupon.service.js";
import type { CouponValidateInput, CreateOrderInput, OrderIdParams, TrackOrderQuery } from "./schema.js";
import * as service from "./service.js";

function userId(req: Request): string {
  return (req.user as AuthUser).id;
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateOrderInput;
  res.status(201).json({ data: await service.createOrder(input, req.user?.id) });
}

export async function validateCoupon(req: Request, res: Response): Promise<void> {
  const input = req.body as CouponValidateInput;
  // A rejected coupon is a normal answer, not an HTTP error (02-architecture §7).
  res.status(200).json({
    data: await couponService.validateCouponCode(input.code, input.subtotal),
  });
}

export async function trackOrder(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as TrackOrderQuery;
  res.status(200).json({ data: await service.trackOrder(query) });
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as OrderIdParams;
  res.status(200).json({ data: await service.getOrderById(id) });
}

export async function listMyOrders(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  res.status(200).json(await service.listMyOrders(userId(req), page, limit));
}

export async function getMyOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  res.status(200).json({ data: await service.getMyOrder(userId(req), id) });
}

export async function cancelMyOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  res.status(200).json({ data: await service.cancelMyOrder(userId(req), id) });
}

export async function requestReturn(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  res.status(200).json({ data: await service.requestReturn(userId(req), id) });
}