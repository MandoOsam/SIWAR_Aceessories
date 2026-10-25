import type { Request, Response } from "express";

import * as couponService from "./coupon.service.js";
import type { CouponValidateInput, CreateOrderInput, OrderIdParams, TrackOrderQuery } from "./schema.js";
import * as service from "./service.js";

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
