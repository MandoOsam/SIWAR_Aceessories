import { useTranslation } from "react-i18next";

import CategoryTile from "@/components/CategoryTile";
import { categories } from "@/data/categories";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";
import { cn } from "@/utils/cn";

export function CategoryTiles() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-heading-sm text-fg">{t("categories.title")}</h2>
      </div>
      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-5 md:overflow-visible",
          "snap-x snap-mandatory scroll-smooth",
        )}
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {sortedCategories.map((category) => (
          <div key={category.id} className="min-w-[70%] snap-center md:min-w-0">
            <CategoryTile
              title={localize(category.name, locale)}
              imageUrl={category.imageUrl}
              href={`/category/${category.slug}`}
              alt={localize(category.name, locale)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategoryTiles;
