import type { Request, Response } from "express";

import * as adminService from "./admin.service.js";
import type { AdminListReviewsQuery, ModerateReviewBody } from "./schema.js";

export async function listReviews(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as AdminListReviewsQuery;
  res.status(200).json(await adminService.listReviews(query));
}

export async function moderateReview(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  const body = req.body as ModerateReviewBody;
  res.status(200).json({ data: await adminService.moderateReview(id, body) });
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  await adminService.deleteReview(id);
  res.status(204).end();
}
