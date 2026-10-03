import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useCategories } from "@/hooks/useCatalog";
import { useLocale } from "@/hooks/useLocale";
import { localize } from "@/utils/format";

type CategoryListProps = {
  /** Called after a category is chosen, so the dropdown can close itself. */
  onNavigate: () => void;
};

/** Category list with its own loading, empty and error states. */
export function CategoryList({ onNavigate }: CategoryListProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { data: categories, isPending, isError, refetch } = useCategories();

  if (isPending) {
    return (
      <ul className="space-y-2 p-2">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="p-2">
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm text-accent underline underline-offset-4"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {(categories ?? []).map((category) => (
        <li key={category.id}>
          <Link
            to={ROUTES.category(category.slug)}
            onClick={onNavigate}
            className="flex min-h-11 items-center justify-between gap-3 px-3 text-sm transition-colors duration-500 ease-smooth hover:bg-surface-2 hover:text-accent"
          >
            <span>{localize(category.name, locale)}</span>
            <img
              src={category.imageUrl}
              alt=""
              width={40}
              height={50}
              loading="lazy"
              className="size-10 shrink-0 object-cover opacity-70"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
