import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";

export interface CheckoutFooterProps {
  /** Zero-based index of the step being edited. */
  step: number;
  stepCount: number;
  /** False while the current step has validation errors; disables "Continue". */
  canProceed: boolean;
  isPlacing: boolean;
  placeError: string | null;
  onBack: () => void;
  onNext: () => void;
  onPlaceOrder: () => void;
}

/** Back / Continue controls shared by every checkout step; the last step places the order. */
export function CheckoutFooter({
  step,
  stepCount,
  canProceed,
  isPlacing,
  placeError,
  onBack,
  onNext,
  onPlaceOrder,
}: CheckoutFooterProps) {
  const { t } = useTranslation();
  const isLastStep = step >= stepCount - 1;

  return (
    <>
      <div className="mt-8 flex max-w-xl flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <Button variant="secondary" onClick={onBack}>
            {t("checkout.back")}
          </Button>
        ) : (
          <span className="hidden sm:block" />
        )}
        {isLastStep ? (
          <Button onClick={onPlaceOrder} disabled={isPlacing}>
            {isPlacing ? t("checkout.placing") : t("checkout.placeOrder")}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canProceed}>
            {t("checkout.next")}
          </Button>
        )}
      </div>

      {placeError !== null ? (
        <p role="alert" className="mt-3 max-w-xl text-sm text-accent-2">
          {placeError}
        </p>
      ) : null}
    </>
  );
}

export default CheckoutFooter;
