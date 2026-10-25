import { z } from "zod";

import { UPLOAD_SCOPES } from "@/lib/cloudinary.js";

/** The admin app names the asset area it is uploading for; defaults to products. */
export const signUploadSchema = z.object({
  scope: z.enum(UPLOAD_SCOPES).default("product"),
});

export type SignUploadInput = z.infer<typeof signUploadSchema>;
