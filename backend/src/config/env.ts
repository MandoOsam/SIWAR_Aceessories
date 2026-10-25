import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  SESSION_SECRET: z.string().min(32),

  FRONTEND_ORIGIN: z.string().url(),
  ADMIN_ORIGIN: z.string().url(),
  COOKIE_DOMAIN: z.string().default(""),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Only used by `npm run db:seed`; optional so the API and tests boot without them.
  OWNER_EMAIL: z.string().email().optional(),
  OWNER_PASSWORD: z.string().min(8).optional(),
  OWNER_NAME: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
