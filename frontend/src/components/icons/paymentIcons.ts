import type { ElementType } from "react";

import type { PaymentMethodId } from "@/services/types";

import { InstaPayIcon } from "./InstaPayIcon";
import { VodafoneCashIcon } from "./VodafoneCashIcon";

/**
 * Icons for the transfer payment methods (08-owner-ui-revisions.md §R3.c). Cash on Delivery has no
 * brand mark, so it is intentionally absent and callers fall back to a label-only row.
 */
export const PAYMENT_ICONS: Partial<Record<PaymentMethodId, ElementType>> = {
  instapay: InstaPayIcon,
  "vodafone-cash": VodafoneCashIcon,
};
