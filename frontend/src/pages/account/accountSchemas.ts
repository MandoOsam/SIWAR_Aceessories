/**
 * Zod schemas for the account forms (D-035: Zod + controlled state, not `react-hook-form`).
 *
 * Messages are i18n keys so each page can render them with `t()`. The shared rules reuse the
 * `auth.errors.*` keys (password length/pattern/match, phone) and `account.errors.*` covers the
 * profile-specific ones. `collectErrors` from `components/auth/authSchemas.ts` flattens a
 * `ZodError` into one message per field.
 */

import { z } from "zod";

import { EGYPT_MOBILE_REGEX } from "@/components/checkout/checkoutSchemas";
import { hasLetterAndNumber, PASSWORD_MIN_LENGTH } from "@/utils/password";

export const profileSchema = z.object({
  name: z.string().trim().min(2, { message: "account.errors.nameMin" }),
  displayNameAr: z.string().trim(),
  displayNameEn: z.string().trim(),
  phone: z.union([
    z.literal(""),
    z.string().trim().regex(EGYPT_MOBILE_REGEX, { message: "account.errors.phone" }),
  ]),
});

export type ProfileData = z.infer<typeof profileSchema>;

export const emptyProfile: ProfileData = {
  name: "",
  displayNameAr: "",
  displayNameEn: "",
  phone: "",
};

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "auth.errors.required" }),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: "auth.errors.passwordMin" })
      .refine(hasLetterAndNumber, { message: "auth.errors.passwordPattern" }),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "auth.errors.passwordMatch",
    path: ["confirmPassword"],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export const emptyChangePassword: ChangePasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
