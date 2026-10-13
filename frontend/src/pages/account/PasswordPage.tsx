import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { collectErrors } from "@/components/auth/authSchemas";
import { Button } from "@/components/ui/Button";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import {
  changePasswordSchema,
  emptyChangePassword,
  type ChangePasswordData,
} from "@/pages/account/accountSchemas";
import { AuthError, changePassword } from "@/services/api";
import { toast } from "@/store/toastStore";

/**
 * `/account/password` — change the account password (05-ui-context.md §7.12).
 *
 * On success the form resets and the customer stays signed in (the server rotates the session). A
 * wrong current password is reported on that field, matching the API's `invalid-current-password`.
 */
export default function PasswordPage() {
  const { t } = useTranslation();

  useDocumentMeta(t("account.meta.passwordTitle"), t("account.password.subtitle"));

  const [form, setForm] = useState<ChangePasswordData>(emptyChangePassword);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = (patch: Partial<ChangePasswordData>) =>
    setForm((current) => ({ ...current, ...patch }));

  const fieldError = (key: string): string | undefined => {
    const messageKey = errors[key];
    return messageKey === undefined ? undefined : t(messageKey);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = changePasswordSchema.safeParse(form);
    if (!result.success) {
      const next = collectErrors(result.error);
      setErrors(next);
      setServerError(null);
      const first = Object.keys(next)[0];
      if (first !== undefined) {
        document.getElementById(`password-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
    setServerError(null);
    setPending(true);
    try {
      await changePassword({
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
      });
      setForm(emptyChangePassword);
      toast(t("account.password.saved"));
    } catch (error) {
      if (error instanceof AuthError && error.code === "invalid-current-password") {
        setServerError(t("account.password.incorrect"));
        document.getElementById("password-currentPassword")?.focus();
      } else {
        toast(t("auth.errors.generic"), "error");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-heading text-fg">{t("account.password.title")}</h1>
        <p className="text-fg-muted">{t("account.password.subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="max-w-md space-y-5">
        <PasswordInput
          id="password-currentPassword"
          label={t("account.password.current")}
          value={form.currentPassword}
          onChange={(value) => update({ currentPassword: value })}
          error={fieldError("currentPassword") ?? serverError ?? undefined}
          autoComplete="current-password"
        />

        <PasswordInput
          id="password-newPassword"
          label={t("account.password.new")}
          value={form.newPassword}
          onChange={(value) => update({ newPassword: value })}
          error={fieldError("newPassword")}
          hint={t("auth.password.hint")}
          autoComplete="new-password"
          showStrength
        />

        <PasswordInput
          id="password-confirmPassword"
          label={t("account.password.confirm")}
          value={form.confirmPassword}
          onChange={(value) => update({ confirmPassword: value })}
          error={fieldError("confirmPassword")}
          autoComplete="new-password"
        />

        <Button type="submit" disabled={pending}>
          {pending ? t("account.password.saving") : t("account.password.save")}
        </Button>
      </form>
    </div>
  );
}
