import type { Request, Response } from "express";

import { signUpload } from "@/lib/cloudinary.js";
import type { SignUploadInput } from "./schema.js";

/** Returns a Cloudinary signature; the file itself never passes through the API. */
export function sign(req: Request, res: Response): void {
  const { scope } = req.body as SignUploadInput;
  res.status(200).json({ data: signUpload(scope) });
}
