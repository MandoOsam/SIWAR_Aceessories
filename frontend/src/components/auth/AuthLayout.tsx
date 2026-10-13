import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

import { Logo } from "@/components/layout/Logo";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Row shown under the card, e.g. a "already have an account?" link. */
  footer?: ReactNode;
};

const BENEFITS = [
  { key: "auth.brand.benefit1", Icon: Sparkles },
  { key: "auth.brand.benefit2", Icon: ShieldCheck },
  { key: "auth.brand.benefit3", Icon: Truck },
] as const;

/**
 * Shared shell for `/login`, `/register`, `/forgot-password` and `/reset-password`.
 *
 * One column on mobile, a brand panel + form card on desktop. It renders a `<section>` (not `<main>`)
 * because `RootLayout` owns the single `<main>` (D-023). Copy comes entirely from i18n.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <section className="container-page grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
      <aside className="hidden lg:flex lg:flex-col lg:gap-6">
        <p className="font-heading text-display text-fg">{t("auth.brand.title")}</p>
        <p className="max-w-md text-lead text-fg-muted">{t("auth.brand.body")}</p>
        <ul className="space-y-3">
          {BENEFITS.map(({ key, Icon }) => (
            <li key={key} className="flex items-center gap-3 text-sm text-fg-muted">
              <span className="flex size-9 items-center justify-center rounded-pill bg-surface-2 text-accent">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
      </aside>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex justify-center lg:hidden">
          <Logo />
        </div>

        <div className="motion-safe:animate-fade-in rounded-card border border-line bg-surface p-6 sm:p-8">
          <header className="mb-6 space-y-2">
            <h1 className="font-heading text-heading">{title}</h1>
            {subtitle !== undefined ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
          </header>
          {children}
        </div>

        {footer !== undefined ? (
          <div className="mt-6 text-center text-sm text-fg-muted">{footer}</div>
        ) : null}
      </div>
    </section>
  );
}
