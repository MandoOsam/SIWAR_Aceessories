import type { Request, Response } from "express";

import * as reviewsService from "./service.js";
import type { CreateReviewBody, ListReviewsQuery } from "./schema.js";

export async function listReviews(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as ListReviewsQuery;
  res.status(200).json(await reviewsService.listReviews(query));
}

export async function listProductReviews(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  const query = req.validatedQuery as ListReviewsQuery;
  res.status(200).json(await reviewsService.listProductReviews(id, query));
}

export async function createReview(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as { id: string };
  const body = req.body as CreateReviewBody;
  const review = await reviewsService.createReview(id, body, req.user);
  res.status(201).json({ data: review });
}
