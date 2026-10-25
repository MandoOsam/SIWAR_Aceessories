import type { Request, Response } from "express";

import * as catalogService from "./service.js";
import type { ListProductsQuery, SlugParams } from "./schema.js";

export async function listCategories(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: await catalogService.listCategories() });
}

export async function getCategory(req: Request, res: Response): Promise<void> {
  const { slug } = req.validatedParams as SlugParams;
  // Null (not 404) so the storefront can tell "no such category" from a failed request;
  // `getCategoryBySlug` in the frontend service is typed `Category | null`.
  res.status(200).json({ data: await catalogService.getCategoryBySlug(slug) });
}

export async function listProducts(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as ListProductsQuery;
  const { category, ...rest } = query;

  const result = await catalogService.listProducts({
    ...rest,
    ...(category === undefined ? {} : { categorySlug: category }),
  });
  res.status(200).json(result);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { slug } = req.validatedParams as SlugParams;
  // Null (not 404): the product page shows its not-found state only when the
  // request succeeded with no product (`useProduct` -> `isNotFound`).
  res.status(200).json({ data: await catalogService.getProductDetail(slug) });
}
