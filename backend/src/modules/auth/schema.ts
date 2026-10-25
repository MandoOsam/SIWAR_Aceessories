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

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
