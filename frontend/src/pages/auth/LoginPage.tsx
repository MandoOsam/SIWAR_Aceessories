import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import {
  collectErrors,
  emptyLogin,
  fieldError,
  loginSchema,
  type LoginData,
} from "@/components/auth/authSchemas";
import { CONTROL_CLASSES, Field } from "@/components/checkout/fields";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { AuthError, getDemoCredentials, login } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { safeInternalPath } from "@/utils/redirect";

/** `/login` — email + password sign-in with a safe post-login redirect (05-ui-context.md §7.11). */
export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const redirectTo = safeInternalPath(params.get("redirect"), ROUTES.account);
  const demo = getDemoCredentials();

  useDocumentMeta(t("auth.meta.loginTitle"), t("auth.login.subtitle"));

  const [form, setForm] = useState<LoginData>(
    demo !== null ? { email: demo.email, password: "" } : emptyLogin,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const update = (patch: Partial<LoginData>) => setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const next = collectErrors(result.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first !== undefined) {
        document.getElementById(`login-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
    setFormError(null);
    setPending(true);
    try {
      const user = await login(result.data);
      setUser(user);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof AuthError && error.code === "invalid-credentials"
          ? t("auth.errors.invalidCredentials")
          : t("auth.errors.generic"),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <>
          {t("auth.login.noAccount")}{" "}
          <Link to={ROUTES.register} className="text-accent hover:underline">
            {t("auth.login.createAccount")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError !== null ? (
          <p
            role="alert"
            className="rounded-control border border-accent-2 px-4 py-3 text-sm text-accent-2"
          >
            {formError}
          </p>
        ) : null}

        <Field id="login-email" label={t("auth.login.email")} error={fieldError(t, errors.email)}>
          {({ describedBy, invalid }) => (
            <input
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              value={form.email}
              onChange={(event) => update({ email: event.target.value })}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <PasswordInput
          id="login-password"
          label={t("auth.login.password")}
          value={form.password}
          onChange={(value) => update({ password: value })}
          error={fieldError(t, errors.password)}
          autoComplete="current-password"
        />

        <div className="text-sm">
          <Link to={ROUTES.forgotPassword} className="text-accent hover:underline">
            {t("auth.login.forgot")}
          </Link>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>

      {demo !== null ? (
        <p className="mt-6 rounded-control bg-surface-2 px-4 py-3 text-xs text-fg-muted">
          {t("auth.login.demoHint", { email: demo.email, password: demo.password })}
        </p>
      ) : null}
    </AuthLayout>
  );
}
