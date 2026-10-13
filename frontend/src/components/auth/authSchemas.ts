/**
 * Zod schemas for the auth forms (D-035: Zod + controlled state, not `react-hook-form`).
 *
 * Messages are i18n keys, not prose, so each page can render them with `t()` and the same key set is
 * reused across languages. `collectErrors` flattens a `ZodError` into one message per field, keyed by
 * the input name so the page can look it up while rendering.
 */

import { z } from "zod";

import { EGYPT_MOBILE_REGEX } from "@/components/checkout/checkoutSchemas";
import { hasLetterAndNumber, PASSWORD_MIN_LENGTH } from "@/utils/password";

const emailField = z
  .string()
  .trim()
  .min(1, { message: "auth.errors.required" })
  .pipe(z.email({ message: "auth.errors.email" }));

const strongPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { message: "auth.errors.passwordMin" })
  .refine(hasLetterAndNumber, { message: "auth.errors.passwordPattern" });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: "auth.errors.required" }),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { message: "auth.errors.nameMin" }),
    email: emailField,
    phone: z.union([
      z.literal(""),
      z.string().trim().regex(EGYPT_MOBILE_REGEX, {
        message: "auth.errors.phone",
      }),
    ]),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "auth.errors.passwordMatch",
    path: ["confirmPassword"],
  });

export const forgotSchema = z.object({ email: emailField });

export const resetSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "auth.errors.passwordMatch",
    path: ["confirmPassword"],
  });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotData = z.infer<typeof forgotSchema>;
export type ResetData = z.infer<typeof resetSchema>;

export const emptyLogin: LoginData = { email: "", password: "" };
export const emptyRegister: RegisterData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};
export const emptyForgot: ForgotData = { email: "" };
export const emptyReset: ResetData = { password: "", confirmPassword: "" };

/** One i18n-key message per invalid field (first issue wins), keyed by input name. */
export function collectErrors(error: z.ZodError): Record<string, string> {
  const messages: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    messages[field] ??= issue.message;
  }
  return messages;
}
