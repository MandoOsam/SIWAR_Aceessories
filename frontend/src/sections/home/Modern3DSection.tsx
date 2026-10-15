import { useTranslation } from "react-i18next";

import MiniRing3D from "./MiniRing3D";

export function Modern3DSection() {
  const { t } = useTranslation();
  const fallback = "/assets/hero/hero-poster.jpg";

  return (
    <section className="container-page py-12">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="font-heading text-heading-sm tracking-tight">
            {t("home.modern3D.title", "Modern Form. Lasting Strength.")}
          </h2>
          <p className="mt-3 max-w-xl text-lead text-fg-muted">
            {t(
              "home.modern3D.subtitle",
              "Sleek, minimal geometry designed to feel modern and distinctly SIWAR.",
            )}
          </p>
        </div>
        <div className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
          <MiniRing3D fallbackImage={fallback} className="size-full" />
        </div>
      </div>
    </section>
  );
}

export default Modern3DSection;
