import { useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CartItem } from "@/components/CartItem";
import { CartSummary } from "@/components/CartSummary";
import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { selectCartCount, selectSavedCount, useCartStore } from "@/store/cartStore";

/**
 * `/cart` (05-ui-context.md §7.7): the item list on one side and the summary on the other, plus a
 * "saved for later" section. On mobile the summary stacks under the list.
 *
 * Totals are display-only; the server recomputes them when the order is created
 * (02-architecture.md §10). Empty cart shows a single call to browse the shop.
 */
export default function CartPage() {
  const { t } = useTranslation();

  const items = useCartStore((state) => state.items);
  const saved = useCartStore((state) => state.saved);
  const count = useCartStore(selectCartCount);
  const savedCount = useCartStore(selectSavedCount);
  const setQty = useCartStore((state) => state.setQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const saveForLater = useCartStore((state) => state.saveForLater);
  const moveToCart = useCartStore((state) => state.moveToCart);
  const removeSaved = useCartStore((state) => state.removeSaved);

  // Minimal per-page SEO until the F7 pass: document title + meta description from i18n (D-040).
  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("cart.meta.title");
    const existing = document.querySelector('meta[name="description"]');
    const previousDescription = existing?.getAttribute("content") ?? "";
    let created: HTMLMetaElement | null = null;
    if (existing === null) {
      created = document.createElement("meta");
      created.name = "description";
      created.content = t("cart.meta.description");
      document.head.appendChild(created);
    } else {
      existing.setAttribute("content", t("cart.meta.description"));
    }
    return () => {
      document.title = previousTitle;
      existing?.setAttribute("content", previousDescription);
      created?.remove();
    };
  }, [t]);

  return (
    <div className="container-page pb-16 pt-6 lg:pb-20">
      <header className="border-b border-line pb-6">
        <nav aria-label={t("cart.breadcrumb.label")} className="text-sm text-fg-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                to={ROUTES.home}
                className="transition-colors duration-500 ease-smooth hover:text-accent"
              >
                {t("cart.breadcrumb.home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t("cart.title")}</li>
          </ol>
        </nav>
        <h1 className="mt-4 font-heading text-heading">
          {t("cart.title")}
          {count > 0 ? (
            <span className="ms-3 align-middle text-base text-fg-muted">
              {t("cart.itemCount", { count })}
            </span>
          ) : null}
        </h1>
      </header>

      {count === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <ShoppingBag aria-hidden="true" className="size-12 text-fg-muted" />
          <div>
            <h2 className="font-heading text-heading-sm">{t("cart.empty.title")}</h2>
            <p className="mx-auto mt-2 max-w-md text-fg-muted">{t("cart.empty.body")}</p>
          </div>
          <ButtonLink to={ROUTES.shop} className="mt-2">
            {t("cart.empty.action")}
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
          <section aria-label={t("cart.title")}>
            <ul>
              {items.map((item) => (
                <li key={item.key}>
                  <CartItem
                    item={item}
                    onQtyChange={setQty}
                    onRemove={removeItem}
                    onSaveForLater={saveForLater}
                  />
                </li>
              ))}
            </ul>
          </section>

          <aside className="mt-8 lg:sticky lg:top-24 lg:mt-0">
            <CartSummary />
          </aside>
        </div>
      )}

      {savedCount > 0 ? (
        <section aria-label={t("cart.saved.title")} className="mt-12 border-t border-line pt-8">
          <h2 className="font-heading text-heading-sm">
            {t("cart.saved.title")}
            <span className="ms-3 align-middle text-base text-fg-muted">
              {t("cart.itemCount", { count: savedCount })}
            </span>
          </h2>
          <ul className="mt-4">
            {saved.map((item) => (
              <li key={item.key}>
                <CartItem
                  item={item}
                  mode="saved"
                  onRemove={removeSaved}
                  onMoveToCart={moveToCart}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
