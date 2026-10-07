import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/cn";
import { localize } from "@/utils/format";
import { useLocale } from "@/hooks/useLocale";
import { homeContent } from "@/data/content";

export function FeaturedCollections() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const collections = homeContent.featuredCollections;

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-12">
      <h2 className="mb-6 font-heading text-heading-sm text-fg">{t("product.featuredCollections")}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {collections.map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className={cn(
              "group relative flex aspect-[16/10] items-end overflow-hidden rounded-card bg-surface-2",
              index % 2 === 0 ? "md:aspect-[16/9]" : "md:aspect-[16/10]",
            )}
          >
            <img
              src={collection.imageUrl}
              alt={localize(collection.title, locale)}
              loading="lazy"
              width={1200}
              height={675}
              className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-smooth group-hover:scale-110"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/40 transition-opacity duration-500 ease-smooth group-hover:bg-black/30" />
            <div className="relative z-10 flex flex-col gap-2 p-6">
              <h3 className="font-heading text-heading-sm text-on-hero">
                {localize(collection.title, locale)}
                {index === 0 && (
                  <em className="ms-2 font-heading italic text-accent">
                    {locale === "ar" ? "" : ""}
                  </em>
                )}
              </h3>
              <p className="text-sm text-on-hero-muted">{localize(collection.subtitle, locale)}</p>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-accent transition-colors hover:text-accent/80">
                {t("product.viewAll")}
                <span aria-hidden="true" className="rtl-flip">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCollections;
