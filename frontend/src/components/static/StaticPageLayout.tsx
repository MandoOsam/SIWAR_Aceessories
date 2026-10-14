import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "@/config/app";
import { cn } from "@/utils/cn";

interface StaticPageLayoutProps {
  title: string;
  /** Optional one-line lead shown under the title. */
  lead?: string;
  children: ReactNode;
  /** Optional aside (e.g. contact channels); stacks under the content on every breakpoint. */
  sidebar?: ReactNode;
  className?: string;
}

/**
 * Shared shell for the static pages (`/about`, `/contact`, `/faq`, ...).
 *
 * Renders a breadcrumb + title header, the content slot and an optional sidebar inside a 768px
 * column. It uses `<section>`, not `<main>`, because `RootLayout` owns the single `<main>` (D-023).
 */
export function StaticPageLayout({
  title,
  lead,
  children,
  sidebar,
  className,
}: StaticPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("container-page pb-16 pt-10 lg:pb-20", className)}>
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-line pb-6">
          <nav aria-label={t("staticPages.breadcrumb.label")} className="text-sm text-fg-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  to={ROUTES.home}
                  className="transition-colors duration-500 ease-smooth hover:text-accent"
                >
                  {t("staticPages.breadcrumb.home")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{title}</li>
            </ol>
          </nav>
          <h1 className="mt-4 font-heading text-heading">{title}</h1>
          {lead !== undefined ? <p className="mt-3 text-lead text-fg-muted">{lead}</p> : null}
        </header>

        <div className="mt-8">{children}</div>

        {sidebar !== undefined ? <div className="mt-10">{sidebar}</div> : null}
      </div>
    </div>
  );
}

export default StaticPageLayout;
