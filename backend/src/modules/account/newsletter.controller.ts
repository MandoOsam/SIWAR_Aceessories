import type { Request, Response } from "express";

import * as service from "./newsletter.service.js";
import type { NewsletterBody } from "./schema.js";

export async function subscribe(req: Request, res: Response): Promise<void> {
  const body = req.body as NewsletterBody;
  await service.subscribe(body.email);
  res.status(201).json({ data: { subscribed: true } });
}
