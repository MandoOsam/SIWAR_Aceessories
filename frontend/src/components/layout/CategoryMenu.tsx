import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CategoryList } from "@/components/layout/CategoryList";

type CategoryMenuProps = {
  /** On desktop the menu drops below the trigger; inside the drawer it renders as a plain list. */
  variant: "dropdown" | "list";
};

/**
 * Category navigation for the navbar.
 *
 * The items come from the service layer (`GET /categories`) so the owner can add a category from
 * the admin dashboard without touching code. The same list is reused inside the mobile drawer.
 */
export function CategoryMenu({ variant }: CategoryMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "list") {
    return <CategoryList onNavigate={() => undefined} />;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-11 items-center gap-1 text-sm uppercase tracking-[0.14em] transition-colors duration-500 ease-smooth hover:text-accent"
      >
        {t("categories.title")}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform duration-500 ease-smooth ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute start-0 top-full z-50 w-72 border border-line bg-surface p-2 shadow-xl shadow-black/20">
          <CategoryList onNavigate={() => setIsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
