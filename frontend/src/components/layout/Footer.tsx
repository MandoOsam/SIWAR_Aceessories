import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Logo } from "@/components/layout/Logo";
import { Skeleton } from "@/components/ui/Skeleton";
import { FOOTER_HELP_LINKS, FOOTER_LEGAL_LINKS, FOOTER_SHOP_LINKS } from "@/config/navigation";
import { ROUTES } from "@/config/app";
import type { PaymentMethodId } from "@/services/types";
import { usePublicSettings } from "@/hooks/useCatalog";
import { isPlaceholder } from "@/utils/format";

/** Payment method id from the contract -> i18n key. */
const PAYMENT_LABEL_KEY: Record<PaymentMethodId, string> = {
  cod: "payment.cod",
  instapay: "payment.instapay",
  "vodafone-cash": "payment.vodafoneCash",
};

/**
 * Site footer: brand line, link columns, payment methods, social links and copyright.
 *
 * Contact details and payment methods are not hard-coded — they come from `GET /settings/public`,
 * so the owner edits them from the admin dashboard (05-ui-context.md section 6).
 */
export function Footer() {
  const { t } = useTranslation();
  const { data: settings, isPending } = usePublicSettings();

  const year = new Date().getFullYear();

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
                .map((method) => (
                  <li
                    key={method.id}
                    className="rounded-card border border-line px-3 py-1.5 text-xs text-fg-muted"
                  >
                    {t(PAYMENT_LABEL_KEY[method.id])}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-5 lg:col-start-6">
          <FooterColumn titleKey="footer.shop" items={FOOTER_SHOP_LINKS} />
          <FooterColumn titleKey="footer.help" items={FOOTER_HELP_LINKS} />
          <FooterColumn titleKey="footer.legal" items={FOOTER_LEGAL_LINKS} />
        </div>

        <div className="lg:col-span-3">
          <h2 className="mb-4 font-heading text-xs uppercase tracking-[0.24em] text-fg-muted">
            {t("footer.followUs")}
          </h2>
          <ul className="space-y-1">
            {isPending ? (
              <>
                <Skeleton className="h-11 w-32" />
                <Skeleton className="h-11 w-32" />
              </>
            ) : (
              (settings?.social ?? [])
                // Channels without a URL yet are hidden rather than linked to a broken address.
                .filter((item) => !isPlaceholder(item.url))
                .map((item) => (
                  <li key={item.platform}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex min-h-11 items-center text-sm capitalize text-fg-muted transition-colors duration-500 ease-smooth hover:text-accent"
                    >
                      {item.platform}
                    </a>
                  </li>
                ))
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
