import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Page shell shared by every route.
 *
 * `pt-16 lg:pt-20` clears the fixed navbar, and `min-h-dvh` keeps the footer at the bottom of the
 * viewport on short pages. The search overlay lives here so it can cover the navbar too.
 */
export function RootLayout({ children }: RootLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only-focusable fixed start-4 top-4 z-[60] inline-flex min-h-11 items-center bg-accent px-4 text-on-accent"
      >
        {t("common.skipToContent")}
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>

      <Footer />
      <SearchOverlay />
      <CartDrawer />
    </div>
  );
}
