import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(255);
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a digit");

export const registerSchema = z.object({
  email,
  password,
  name: z.string().trim().min(2).max(255),
  phone: z.string().trim().max(20).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    phone: z.string().trim().max(20).optional(),
    displayName: z
      .object({
        ar: z.string().trim().min(1).max(255),
        en: z.string().trim().min(1).max(255),
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
  })
  .strict();

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
