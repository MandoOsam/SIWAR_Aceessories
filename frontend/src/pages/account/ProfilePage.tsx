import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { collectErrors } from "@/components/auth/authSchemas";
import { Field, CONTROL_CLASSES } from "@/components/checkout/fields";
import { Button } from "@/components/ui/Button";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { emptyProfile, profileSchema, type ProfileData } from "@/pages/account/accountSchemas";
import { updateProfile } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/toastStore";
import { getInitials } from "@/utils/initials";

/**
 * `/account/profile` — edit the customer's personal details (05-ui-context.md §7.12).
 *
 * Email is read-only: changing it needs a verification flow that arrives with the real backend.
 * Avatar upload is deferred (F6.4+), so the current photo is the name's initials.
 */
export default function ProfilePage() {
  const { t } = useTranslation();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useDocumentMeta(t("account.meta.profileTitle"), t("account.profile.subtitle"));

  const [form, setForm] = useState<ProfileData>(() =>
    user === null
      ? emptyProfile
      : {
          name: user.name,
          displayNameAr: user.displayName?.ar ?? "",
          displayNameEn: user.displayName?.en ?? "",
          phone: user.phone ?? "",
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const update = (patch: Partial<ProfileData>) => setForm((current) => ({ ...current, ...patch }));

  const fieldError = (key: string): string | undefined => {
    const messageKey = errors[key];
    return messageKey === undefined ? undefined : t(messageKey);
  };

  const initials = getInitials(form.name);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const next = collectErrors(result.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first !== undefined) {
        document.getElementById(`profile-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
    setPending(true);

    const ar = result.data.displayNameAr;
    const en = result.data.displayNameEn;
    const displayName =
      ar === "" && en === ""
        ? undefined
        : { ar: ar === "" ? result.data.name : ar, en: en === "" ? result.data.name : en };

    try {
      const updated = await updateProfile({
        name: result.data.name,
        phone: result.data.phone,
        displayName,
      });
      setUser(updated);
      toast(t("account.profile.saved"));
    } catch {
      toast(t("auth.errors.generic"), "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-heading text-fg">{t("account.profile.title")}</h1>
        <p className="text-fg-muted">{t("account.profile.subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <h2 className="font-heading text-lg text-fg">{t("account.profile.identity")}</h2>

        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-16 items-center justify-center rounded-pill bg-surface-2 font-heading text-xl text-accent"
          >
            {initials}
          </span>
          <p className="text-sm text-fg-muted">{t("account.profile.avatarHint")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="profile-name"
            label={t("account.profile.name")}
            error={fieldError("name")}
            hint={t("account.profile.nameHint")}
          >
            {({ describedBy, invalid }) => (
              <input
                id="profile-name"
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

          <Field
            id="profile-phone"
            label={t("account.profile.phone")}
            error={fieldError("phone")}
            hint={t("account.profile.phoneHint")}
            optionalLabel={t("auth.optional")}
          >
            {({ describedBy, invalid }) => (
              <input
                id="profile-phone"
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

          <Field
            id="profile-displayNameAr"
            label={t("account.profile.displayNameAr")}
            error={fieldError("displayNameAr")}
            optionalLabel={t("auth.optional")}
          >
            {({ describedBy, invalid }) => (
              <input
                id="profile-displayNameAr"
                name="displayNameAr"
                type="text"
                dir="rtl"
                value={form.displayNameAr}
                onChange={(event) => update({ displayNameAr: event.target.value })}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={CONTROL_CLASSES}
              />
            )}
          </Field>

          <Field
            id="profile-displayNameEn"
            label={t("account.profile.displayNameEn")}
            error={fieldError("displayNameEn")}
            optionalLabel={t("auth.optional")}
          >
            {({ describedBy, invalid }) => (
              <input
                id="profile-displayNameEn"
                name="displayNameEn"
                type="text"
                dir="ltr"
                value={form.displayNameEn}
                onChange={(event) => update({ displayNameEn: event.target.value })}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={CONTROL_CLASSES}
              />
            )}
          </Field>
        </div>

        <Field
          id="profile-email"
          label={t("account.profile.email")}
          error={undefined}
          hint={t("account.profile.emailHint")}
        >
          {({ describedBy }) => (
            <input
              id="profile-email"
              name="email"
              type="email"
              dir="ltr"
              value={user?.email ?? ""}
              readOnly
              disabled
              aria-describedby={describedBy}
              className={`${CONTROL_CLASSES} opacity-60`}
            />
          )}
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? t("account.profile.saving") : t("account.profile.save")}
        </Button>
      </form>
    </div>
  );
}
