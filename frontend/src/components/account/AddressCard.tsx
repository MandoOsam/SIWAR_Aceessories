import { Pencil, Star, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/hooks/useLocale";
import type { Address, Governorate } from "@/services/types";
import { localize } from "@/utils/format";

export interface AddressCardProps {
  address: Address;
  governorates: Governorate[];
  /** Disables every action while a mutation is in flight. */
  busy?: boolean;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onSetDefault: (address: Address) => void;
}

/** One saved delivery address with edit / delete / set-default actions. */
export function AddressCard({
  address,
  governorates,
  busy = false,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const governorateName = governorates.find((item) => item.value === address.governorate)?.name;
  const region =
    governorateName === undefined ? address.governorate : localize(governorateName, locale);

  const streetLine = [address.street, address.building, address.apartment]
    .filter((part) => part !== undefined && part.trim() !== "")
    .join(", ");

  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-fg">{address.city}</p>
          {address.isDefault ? (
            <span className="inline-flex items-center gap-1 rounded-pill border border-accent px-2 py-0.5 text-xs text-accent">
              <Star aria-hidden="true" className="size-3" />
              {t("account.addresses.default")}
            </span>
          ) : null}
        </div>
      </div>

      <address className="space-y-1 text-sm not-italic text-fg-muted">
        <p>{streetLine}</p>
        <p>{region}</p>
        <p dir="ltr" className="text-start">
          {address.phone}
        </p>
      </address>

      <div className="mt-1 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(address)} disabled={busy}>
          <Pencil aria-hidden="true" className="size-4" />
          {t("account.addresses.edit")}
        </Button>

        {!address.isDefault ? (
          <Button variant="ghost" size="sm" onClick={() => onSetDefault(address)} disabled={busy}>
            <Star aria-hidden="true" className="size-4" />
            {t("account.addresses.setDefault")}
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(address)}
          disabled={busy}
          className="hover:text-accent-2"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          {t("account.addresses.delete")}
        </Button>
      </div>
    </article>
  );
}

export default AddressCard;
