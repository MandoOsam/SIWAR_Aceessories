import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { PAYMENT_ICONS } from "@/components/icons/paymentIcons";
import { SOCIAL_ICONS } from "@/components/icons/socialIcons";
import { Logo } from "@/components/layout/Logo";
import { Skeleton } from "@/components/ui/Skeleton";
import { FOOTER_HELP_LINKS, FOOTER_LEGAL_LINKS, FOOTER_SHOP_LINKS } from "@/config/navigation";
import { ROUTES } from "@/config/app";
import type { PaymentMethodId } from "@/services/types";
import { usePublicSettings } from "@/hooks/useCatalog";
import { isPlaceholder, toInternationalPhone } from "@/utils/format";

/** Payment method id from the contract -> i18n key. */
const PAYMENT_LABEL_KEY: Record<PaymentMethodId, string> = {
  cod: "payment.cod",
  instapay: "payment.instapay",
  "vodafone-cash": "payment.vodafoneCash",
};

/**
 * Site footer: brand line, link columns, payment methods, contact channels, social links and
 * copyright.
 *
 * Contact details, payment methods and social URLs are not hard-coded — they come from
 * `GET /settings/public` via `usePublicSettings()`, so the owner edits them from the admin
 * dashboard (05-ui-context.md section 6). Anything still marked `TODO(Mando)` is hidden here rather
 * than rendered as a broken link.
 */
export function Footer() {
  const { t } = useTranslation();
  const { data: settings, isPending } = usePublicSettings();

  const year = new Date().getFullYear();

  const contact = settings?.contact;
  const whatsappUrl =
    contact?.whatsapp !== undefined && !isPlaceholder(contact.whatsapp) ? contact.whatsapp : null;
  const phoneNumber = contact !== undefined && !isPlaceholder(contact.phone) ? contact.phone : null;
  const showContact = whatsappUrl !== null || phoneNumber !== null;

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Logo asLink={false} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-fg-muted">{t("footer.about")}</p>

          <h2 className="mb-3 mt-8 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
            {t("footer.paymentMethods")}
          </h2>
          {isPending ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {(settings?.paymentMethods ?? [])
                .filter((method) => method.isEnabled)
                .map((method) => {
                  const Icon = PAYMENT_ICONS[method.id];
                  const number =
                    method.accountValue !== undefined && !isPlaceholder(method.accountValue)
                      ? method.accountValue
                      : null;
                  return (
                    <li
                      key={method.id}
                      className="flex items-center gap-2 rounded-card border border-line px-3 py-1.5 text-xs text-fg-muted"
                    >
                      {Icon !== undefined ? (
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                      ) : null}
                      <span>{t(PAYMENT_LABEL_KEY[method.id])}</span>
                      {number !== null ? (
                        <span dir="ltr" className="font-medium text-fg">
                          {number}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-5 lg:col-start-6">
          <FooterColumn titleKey="footer.shop" items={FOOTER_SHOP_LINKS} />
          <FooterColumn titleKey="footer.help" items={FOOTER_HELP_LINKS} />
          <FooterColumn titleKey="footer.legal" items={FOOTER_LEGAL_LINKS} />
        </div>

        <div className="lg:col-span-3">
          {showContact && (
            <div className="mb-8">
              <h2 className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
                {t("footer.contactUs")}
              </h2>
              <ul className="space-y-1">
                {whatsappUrl !== null && (
                  <li>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
                    >
                      <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
                      {t("footer.whatsappCta")}
                    </a>
                  </li>
                )}
                {phoneNumber !== null && (
                  <li>
                    <a
                      href={`tel:${toInternationalPhone(phoneNumber)}`}
                      className="inline-flex min-h-11 min-w-11 items-center text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
                    >
                      <span className="sr-only">{t("footer.phoneLabel")}: </span>
                      {/* A phone number stays left-to-right even inside the RTL layout. */}
                      <span dir="ltr">{phoneNumber}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          <h2 className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
            {t("footer.followUs")}
          </h2>
          <ul className="-ms-2 flex flex-wrap">
            {isPending ? (
              <>
                <Skeleton className="size-11" />
                <Skeleton className="size-11" />
              </>
            ) : (
              (settings?.social ?? [])
                // Channels without a URL yet are hidden rather than linked to a broken address.
                .filter((item) => !isPlaceholder(item.url))
                .map((item) => {
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
                })
            )}
          </ul>

          <Link
            to={ROUTES.trackOrder}
            className="mt-8 inline-flex min-h-11 min-w-11 items-center text-sm text-accent underline underline-offset-4"
          >
            {t("footer.links.trackOrder")}
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-1 py-6 text-xs text-fg-muted sm:flex-row">
          <p>{t("footer.copyright", { year })}</p>
          {settings === undefined || isPlaceholder(settings.contact.email) ? null : (
            <p dir="ltr">{settings.contact.email}</p>
          )}
        </div>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  titleKey: string;
  items: { labelKey: string; href: string }[];
};

function FooterColumn({ titleKey, items }: FooterColumnProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
        {t(titleKey)}
      </h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className="inline-flex min-h-11 min-w-11 items-center text-sm text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
            >
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
