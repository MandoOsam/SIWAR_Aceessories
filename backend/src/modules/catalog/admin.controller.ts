import type { Request, Response } from "express";

import * as productsService from "./admin.products.service.js";
import * as service from "./admin.service.js";
import type {
  AdminCategoryListQuery,
  AdminProductListQuery,
  CreateCategoryInput,
  CreateProductInput,
  IdParams,
  UpdateCategoryInput,
  UpdateProductInput,
} from "./admin.schema.js";

export async function listCategories(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as AdminCategoryListQuery;
  res.status(200).json({ data: await service.listCategories(query) });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateCategoryInput;
  res.status(201).json({ data: await service.createCategory(input) });
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as IdParams;
  const input = req.body as UpdateCategoryInput;
  res.status(200).json({ data: await service.updateCategory(id, input) });
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as IdParams;
  await service.deleteCategory(id);
  res.status(204).send();
}

export async function listProducts(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as AdminProductListQuery;
  res.status(200).json(await productsService.listProducts(query));
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as IdParams;
  res.status(200).json({ data: await productsService.getProduct(id) });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateProductInput;
  res.status(201).json({ data: await productsService.createProduct(input) });
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as IdParams;
  const input = req.body as UpdateProductInput;
  res.status(200).json({ data: await productsService.updateProduct(id, input) });
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.validatedParams as IdParams;
  await productsService.deleteProduct(id);
  res.status(204).send();
}
