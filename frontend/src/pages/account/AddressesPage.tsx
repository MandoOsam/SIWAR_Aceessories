import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";

import { AccountEmpty } from "@/components/account/AccountEmpty";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressForm } from "@/components/account/AddressForm";
import { emptyAddressForm, toAddressInput, toFormValues } from "@/components/account/addressSchema";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  listGovernorates,
  setDefaultAddress,
  updateAddress,
} from "@/services/api";
import type { Address, AddressInput } from "@/services/types";
import { toast } from "@/store/toastStore";

const ADDRESSES_KEY = ["account", "addresses"] as const;

/**
 * `/account/addresses` — the saved delivery-address book (`05-ui-context.md` §7.12).
 *
 * Lists saved addresses and switches between the list and the reusable `AddressForm` for add/edit.
 * Every mutation invalidates `["account","addresses"]` so the list and the default flag stay fresh.
 */
export default function AddressesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  useDocumentMeta(t("account.meta.addressesTitle"), t("account.addresses.subtitle"));

  const addressesQuery = useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: ({ signal }) => getMyAddresses(signal),
  });
  const governoratesQuery = useQuery({
    queryKey: ["checkout", "governorates"],
    queryFn: ({ signal }) => listGovernorates(signal),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (values: AddressInput) => createAddress(values),
    onSuccess: () => {
      toast(t("account.addresses.saved"));
      setEditing(null);
      invalidate();
    },
    onError: () => toast(t("auth.errors.generic"), "error"),
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; values: AddressInput }) => updateAddress(args.id, args.values),
    onSuccess: () => {
      toast(t("account.addresses.saved"));
      setEditing(null);
      invalidate();
    },
    onError: () => toast(t("auth.errors.generic"), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      toast(t("account.addresses.removed"));
      invalidate();
    },
    onError: () => toast(t("auth.errors.generic"), "error"),
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: () => {
      toast(t("account.addresses.defaultUpdated"));
      invalidate();
    },
    onError: () => toast(t("auth.errors.generic"), "error"),
  });

  const addresses = addressesQuery.data ?? [];
  const governorates = governoratesQuery.data ?? [];
  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    defaultMutation.isPending;

  const handleDelete = (address: Address) => {
    if (window.confirm(t("account.addresses.deleteConfirm"))) {
      deleteMutation.mutate(address.id);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-heading text-heading text-fg">{t("account.addresses.title")}</h1>
          <p className="text-fg-muted">{t("account.addresses.subtitle")}</p>
        </div>
        {editing === null && addresses.length > 0 ? (
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" className="size-4" />
            {t("account.addresses.add")}
          </Button>
        ) : null}
      </header>

      {editing === "new" ? (
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="mb-5 font-heading text-lg text-fg">{t("account.addresses.addTitle")}</h2>
          <AddressForm
            initial={emptyAddressForm}
            governorates={governorates}
            submitLabel={t("account.addresses.save")}
            pending={createMutation.isPending}
            onSubmit={(values) => createMutation.mutate(toAddressInput(values))}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : editing !== null ? (
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="mb-5 font-heading text-lg text-fg">{t("account.addresses.editTitle")}</h2>
          <AddressForm
            initial={toFormValues(editing)}
            governorates={governorates}
            submitLabel={t("account.addresses.save")}
            pending={updateMutation.isPending}
            onSubmit={(values) =>
              updateMutation.mutate({ id: editing.id, values: toAddressInput(values) })
            }
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : addressesQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : addressesQuery.isError ? (
        <div className="space-y-3 rounded-card border border-line bg-surface p-6 text-center">
          <p className="text-fg-muted">{t("common.error")}</p>
          <Button variant="secondary" size="sm" onClick={() => void addressesQuery.refetch()}>
            {t("common.retry")}
          </Button>
        </div>
      ) : addresses.length === 0 ? (
        <AccountEmpty
          Icon={MapPin}
          title={t("account.addresses.emptyTitle")}
          description={t("account.addresses.emptyBody")}
          action={<Button onClick={() => setEditing("new")}>{t("account.addresses.add")}</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              governorates={governorates}
              busy={busy}
              onEdit={setEditing}
              onDelete={handleDelete}
              onSetDefault={(item) => defaultMutation.mutate(item.id)}
            />
          ))}
        </div>
      )}

      {!addressesQuery.isPending && editing === null && addresses.length > 0 ? (
        <p className="text-sm text-fg-muted">
          {t("account.addresses.checkoutHint")}{" "}
          <ButtonLink to={ROUTES.checkout} variant="ghost" size="sm">
            {t("account.addresses.checkoutLink")}
          </ButtonLink>
        </p>
      ) : null}
    </div>
  );
}
