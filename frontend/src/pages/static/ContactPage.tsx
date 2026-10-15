import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";

import { CONTROL_CLASSES, Field } from "@/components/checkout/fields";
import { SOCIAL_ICONS } from "@/components/icons/socialIcons";
import { StaticPageLayout } from "@/components/static/StaticPageLayout";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { usePublicSettings } from "@/hooks/useCatalog";
import { isPlaceholder, toInternationalPhone } from "@/utils/format";

const contactSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  message: z.string().trim().min(10),
});

type ContactField = "name" | "email" | "message";

/**
 * `/contact` (05-ui-context.md §7.13): a message form plus the store's contact channels.
 *
 * Channels come from `GET /settings/public` (never hard-coded), and anything still `TODO(Mando)`
 * is hidden. There is no contact endpoint in the contract yet (B4/B6), so submitting acknowledges
 * locally (D-050); the form validates with Zod + controlled state (D-035, no RHF).
 */
export default function ContactPage() {
  const { t } = useTranslation();
  const { data: settings, isPending } = usePublicSettings();

  useDocumentMeta(t("staticPages.contact.meta.title"), t("staticPages.contact.meta.description"));

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<Record<ContactField, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const canSubmit = contactSchema.safeParse(form).success;
  const errorFor = (field: ContactField): string | undefined =>
    touched[field] && !contactSchema.shape[field].safeParse(form[field]).success
      ? t(`staticPages.contact.form.errors.${field}`)
      : undefined;

  const setField = (field: ContactField, value: string): void =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!contactSchema.safeParse(form).success) {
      return;
    }
    setStatus("sending");
    // Mock acknowledgement until the real contact endpoint exists (B4/B6).
    await new Promise((resolve) => {
      window.setTimeout(resolve, 500);
    });
    setForm({ name: "", email: "", message: "" });
    setTouched({ name: false, email: false, message: false });
    setStatus("sent");
  };

  const contact = settings?.contact;
  const whatsappUrl =
    contact?.whatsapp !== undefined && !isPlaceholder(contact.whatsapp) ? contact.whatsapp : null;
  const phoneNumber = contact !== undefined && !isPlaceholder(contact.phone) ? contact.phone : null;
  const email = contact !== undefined && !isPlaceholder(contact.email) ? contact.email : null;
  const socials = (settings?.social ?? []).filter((item) => !isPlaceholder(item.url));

  return (
    <StaticPageLayout
      title={t("staticPages.contact.title")}
      lead={t("staticPages.contact.lead")}
      sidebar={
        <aside
          aria-label={t("staticPages.contact.infoTitle")}
          className="rounded-card border border-line bg-surface p-6"
        >
          <h2 className="font-heading text-heading-sm">{t("staticPages.contact.infoTitle")}</h2>
          {isPending ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-11 w-48" />
              <Skeleton className="h-11 w-40" />
            </div>
          ) : (
            <ul className="mt-4 space-y-1">
              {whatsappUrl !== null ? (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
                  >
                    <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
                    {t("staticPages.contact.whatsapp")}
                  </a>
                </li>
              ) : null}
              {phoneNumber !== null ? (
                <li>
                  <a
                    href={`tel:${toInternationalPhone(phoneNumber)}`}
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
                  >
                    <Phone aria-hidden="true" className="size-4 shrink-0" />
                    <span dir="ltr">{phoneNumber}</span>
                  </a>
                </li>
              ) : null}
              {email !== null ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
                  >
                    <Mail aria-hidden="true" className="size-4 shrink-0" />
                    <span dir="ltr">{email}</span>
                  </a>
                </li>
              ) : null}
            </ul>
          )}

          {socials.length > 0 ? (
            <>
              <h3 className="mb-2 mt-6 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
                {t("staticPages.contact.followUs")}
              </h3>
              <ul className="-ms-2 flex flex-wrap">
                {socials.map((item) => {
                  const Icon = SOCIAL_ICONS[item.platform];
                  return (
                    <li key={item.platform}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={t("social.openInNewTab", {
                          platform: t(`social.${item.platform}`),
                        })}
                        className="inline-flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
                      >
                        <Icon aria-hidden="true" className="size-6" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </aside>
      }
    >
      <h2 className="font-heading text-heading-sm">{t("staticPages.contact.formTitle")}</h2>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-5" noValidate>
        <Field id="contact-name" label={t("staticPages.contact.form.name")} error={errorFor("name")}>
          {({ describedBy, invalid }) => (
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              onBlur={() => setTouched((state) => ({ ...state, name: true }))}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              placeholder={t("staticPages.contact.form.namePlaceholder")}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <Field id="contact-email" label={t("staticPages.contact.form.email")} error={errorFor("email")}>
          {({ describedBy, invalid }) => (
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              onBlur={() => setTouched((state) => ({ ...state, email: true }))}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              placeholder={t("staticPages.contact.form.emailPlaceholder")}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <Field
          id="contact-message"
          label={t("staticPages.contact.form.message")}
          error={errorFor("message")}
        >
          {({ describedBy, invalid }) => (
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={(event) => setField("message", event.target.value)}
              onBlur={() => setTouched((state) => ({ ...state, message: true }))}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              placeholder={t("staticPages.contact.form.messagePlaceholder")}
              className={CONTROL_CLASSES}
            />
          )}
        </Field>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={!canSubmit || status === "sending"}>
            {status === "sending"
              ? t("staticPages.contact.form.sending")
              : t("staticPages.contact.form.submit")}
          </Button>
          <p aria-live="polite" className="text-sm text-accent">
            {status === "sent" ? t("staticPages.contact.form.success") : ""}
          </p>
        </div>
      </form>

      {/* Floating CTA (08-owner-ui-revisions.md §R3.b). */}
      <WhatsAppFab />
    </StaticPageLayout>
  );
}
