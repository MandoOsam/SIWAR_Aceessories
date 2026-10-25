import { v2 as cloudinary } from "cloudinary";

import { env } from "@/config/env.js";

/**
 * Cloudinary signed uploads (02-architecture section 7, `POST /admin/uploads/sign`).
 *
 * The API never receives the file: it only returns a short-lived signature that
 * the admin app uses to upload straight to Cloudinary. The API secret stays on
 * the server.
 */
export const UPLOAD_SCOPES = ["product", "category", "content"] as const;
export type UploadScope = (typeof UPLOAD_SCOPES)[number];

const FOLDERS: Record<UploadScope, string> = {
  product: "siwar/products",
  category: "siwar/categories",
  content: "siwar/content",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_FORMATS = ["jpg", "jpeg", "png", "webp"] as const;

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
  maxBytes: number;
  allowedFormats: readonly string[];
};

/**
 * Signs a direct upload for one folder. The client must post `file`, `api_key`,
 * `timestamp`, `folder` and `signature` to `uploadUrl`; Cloudinary rejects any
 * folder the signature does not cover, so a signed product upload cannot be
 * reused to write into another asset area.
 */
export function signUpload(scope: UploadScope, now: Date = new Date()): UploadSignature {
  const folder = FOLDERS[scope];
  const timestamp = Math.floor(now.getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    env.CLOUDINARY_API_SECRET,
  );

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    maxBytes: MAX_UPLOAD_BYTES,
    allowedFormats: ALLOWED_UPLOAD_FORMATS,
  };
}
