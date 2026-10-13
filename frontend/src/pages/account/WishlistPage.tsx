import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";

import { AccountEmpty } from "@/components/account/AccountEmpty";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridError } from "@/components/ProductGridError";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useProducts } from "@/hooks/useCatalog";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { useWishlistStore } from "@/store/wishlist";
import { buildCartItem } from "@/utils/product";

/**
 * `/account/wishlist` (also `/wishlist`) — the customer's saved products (`05-ui-context.md` §7.12).
 *
 * The wishlist holds product ids; the full catalogue is fetched once and filtered down to the saved
 * ids (the real API will expose `GET /account/wishlist`, replacing the filter). Reuses `ProductGrid`,
 * whose heart already reflects and updates the same store.
 */
export default function WishlistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = useWishlistStore((state) => state.items);
  const clear = useWishlistStore((state) => state.clear);
  const addItem = useCartStore((state) => state.addItem);

  useDocumentMeta(t("account.meta.wishlistTitle"), t("account.wishlist.subtitle"));

  const productsQuery = useProducts({ limit: 100 });
  const saved = (productsQuery.data?.data ?? []).filter((product) => items.includes(product.id));

  const handleMoveAll = () => {
    for (const product of saved) {
      addItem(buildCartItem(product, {}, 1));
    }
    toast(t("account.wishlist.movedAll"));
    clear();
    navigate(ROUTES.cart);
  };

  const isEmpty = items.length === 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-heading text-heading text-fg">{t("account.wishlist.title")}</h1>
          <p className="text-fg-muted">{t("account.wishlist.subtitle")}</p>
        </div>
        {!isEmpty && !productsQuery.isPending ? (
          <Button onClick={handleMoveAll}>
            <ShoppingBag aria-hidden="true" className="size-4" />
            {t("account.wishlist.moveAll")}
          </Button>
        ) : null}
      </header>

      {isEmpty ? (
        <AccountEmpty
          Icon={Heart}
          title={t("account.wishlist.emptyTitle")}
          description={t("account.wishlist.emptyBody")}
          action={<ButtonLink to={ROUTES.shop}>{t("account.wishlist.emptyCta")}</ButtonLink>}
        />
      ) : productsQuery.isPending ? (
        <ProductGridSkeleton />
      ) : productsQuery.isError ? (
        <ProductGridError onRetry={() => void productsQuery.refetch()} />
      ) : saved.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-6 text-center text-sm text-fg-muted">
          {t("account.wishlist.unavailable")}
        </p>
      ) : (
        <ProductGrid products={saved} />
      )}
    </div>
  );
}
