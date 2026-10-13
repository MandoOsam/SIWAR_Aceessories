import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import {
  collectErrors,
  emptyRegister,
  registerSchema,
  type RegisterData,
} from "@/components/auth/authSchemas";
import { CONTROL_CLASSES, Field } from "@/components/checkout/fields";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { AuthError, register } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { safeInternalPath } from "@/utils/redirect";

/** `/register` — create an account; success signs the customer in (05-ui-context.md §7.11). */
export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const redirectTo = safeInternalPath(params.get("redirect"), ROUTES.account);

  useDocumentMeta(t("auth.meta.registerTitle"), t("auth.register.subtitle"));

  const [form, setForm] = useState<RegisterData>(emptyRegister);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const update = (patch: Partial<RegisterData>) => setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const next = collectErrors(result.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first !== undefined) {
        document.getElementById(`register-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
    setFormError(null);
    setPending(true);
    try {
      const user = await register({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        password: result.data.password,
      });
      setUser(user);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof AuthError && error.code === "email-taken"
          ? t("auth.errors.emailTaken")
          : t("auth.errors.generic"),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footer={
        <>
          {t("auth.register.haveAccount")}{" "}
          <Link to={ROUTES.login} className="text-accent hover:underline">
            {t("auth.register.signIn")}
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

        <Field id="register-name" label={t("auth.register.name")} error={errors.name}>
          {({ describedBy, invalid }) => (
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => update({ name: event.target.value })}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <Field id="register-email" label={t("auth.register.email")} error={errors.email}>
          {({ describedBy, invalid }) => (
            <input
              id="register-email"
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

        <Field
          id="register-phone"
          label={t("auth.register.phone")}
          error={errors.phone}
          hint={t("auth.register.phoneHint")}
          optionalLabel={t("auth.optional")}
        >
          {({ describedBy, invalid }) => (
            <input
              id="register-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              value={form.phone}
              onChange={(event) => update({ phone: event.target.value })}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <PasswordInput
          id="register-password"
          label={t("auth.register.password")}
          value={form.password}
          onChange={(value) => update({ password: value })}
          error={errors.password}
          hint={t("auth.password.hint")}
          autoComplete="new-password"
          showStrength
        />

        <PasswordInput
          id="register-confirmPassword"
          label={t("auth.register.confirmPassword")}
          value={form.confirmPassword}
          onChange={(value) => update({ confirmPassword: value })}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("auth.register.submitting") : t("auth.register.submit")}
        </Button>
      </form>
    </AuthLayout>
  );
}
