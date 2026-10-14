import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  collectErrors,
  emptyForgot,
  fieldError,
  forgotSchema,
  type ForgotData,
} from "@/components/auth/authSchemas";
import { CONTROL_CLASSES, Field } from "@/components/checkout/fields";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { forgotPassword } from "@/services/api";

/** `/forgot-password` — request a reset link. Success is always the same, to avoid email probing. */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  useDocumentMeta(t("auth.meta.forgotTitle"), t("auth.forgot.subtitle"));

  const [form, setForm] = useState<ForgotData>(emptyForgot);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = forgotSchema.safeParse(form);
    if (!result.success) {
      const next = collectErrors(result.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first !== undefined) {
        document.getElementById(`forgot-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await forgotPassword(result.data);
      setSent(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
      footer={
        <Link to={ROUTES.login} className="text-accent hover:underline">
          {t("auth.forgot.backToLogin")}
        </Link>
      }
    >
      {sent ? (
        <p role="status" className="rounded-control bg-surface-2 px-4 py-3 text-sm text-fg">
          {t("auth.forgot.success")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field id="forgot-email" label={t("auth.forgot.email")} error={fieldError(t, errors.email)}>
            {({ describedBy, invalid }) => (
              <input
                id="forgot-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                value={form.email}
                onChange={(event) => setForm({ email: event.target.value })}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={CONTROL_CLASSES}
              />
            )}
          </Field>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
