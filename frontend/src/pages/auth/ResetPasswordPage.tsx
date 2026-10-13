import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import {
  collectErrors,
  emptyReset,
  resetSchema,
  type ResetData,
} from "@/components/auth/authSchemas";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { AuthError, resetPassword } from "@/services/api";

/** `/reset-password/:token` — set a new password; the token comes from the emailed link. */
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();

  useDocumentMeta(t("auth.meta.resetTitle"), t("auth.reset.subtitle"));

  const [form, setForm] = useState<ResetData>(emptyReset);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const update = (patch: Partial<ResetData>) => setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = resetSchema.safeParse(form);
    if (!result.success) {
      const next = collectErrors(result.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first !== undefined) {
        document.getElementById(`reset-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
    setFormError(null);
    setPending(true);
    try {
      await resetPassword({ token: token ?? "", password: result.data.password });
      setDone(true);
    } catch (error) {
      setFormError(
        error instanceof AuthError && error.code === "invalid-token"
          ? t("auth.errors.invalidToken")
          : t("auth.errors.generic"),
      );
    } finally {
      setPending(false);
    }
  };

  const footer = (
    <Link to={ROUTES.login} className="text-accent hover:underline">
      {t("auth.reset.backToLogin")}
    </Link>
  );

  if (done) {
    return (
      <AuthLayout title={t("auth.reset.title")} footer={footer}>
        <p role="status" className="rounded-control bg-surface-2 px-4 py-3 text-sm text-fg">
          {t("auth.reset.success")}
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("auth.reset.title")} subtitle={t("auth.reset.subtitle")} footer={footer}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError !== null ? (
          <p
            role="alert"
            className="rounded-control border border-accent-2 px-4 py-3 text-sm text-accent-2"
          >
            {formError}
          </p>
        ) : null}

        <PasswordInput
          id="reset-password"
          label={t("auth.reset.password")}
          value={form.password}
          onChange={(value) => update({ password: value })}
          error={errors.password}
          hint={t("auth.password.hint")}
          autoComplete="new-password"
          showStrength
        />

        <PasswordInput
          id="reset-confirmPassword"
          label={t("auth.reset.confirmPassword")}
          value={form.confirmPassword}
          onChange={(value) => update({ confirmPassword: value })}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("auth.reset.submitting") : t("auth.reset.submit")}
        </Button>
      </form>
    </AuthLayout>
  );
}
