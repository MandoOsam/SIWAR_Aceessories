import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";

import { CheckoutStepper } from "@/components/CheckoutStepper";
import { CheckoutFooter } from "@/components/checkout/CheckoutFooter";
import { CheckoutStepView } from "@/components/checkout/CheckoutStepView";
import {
  addressSchema,
  customerSchema,
  emptyAddress,
  emptyCustomer,
  isValid,
  paymentProofSchema,
  type AddressData,
  type CustomerData,
} from "@/components/checkout/checkoutSchemas";
import { buildOrderInput, collectTouchedErrors } from "@/components/checkout/checkoutUtils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/config/app";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLocale } from "@/hooks/useLocale";
import {
  createOrder,
  getPaymentMethods,
  getShippingOptions,
  listGovernorates,
  OrderError,
} from "@/services/api";
import type { PaymentMethodId } from "@/services/types";
import { selectCartCount, selectDiscount, selectSubtotal, useCartStore } from "@/store/cartStore";
import { localize } from "@/utils/format";

const STEP_IDS = ["customer", "address", "delivery", "payment", "review"] as const;

/**
 * `/checkout` (05-ui-context.md §7.8): a five-step guest flow. State lives here so every step is a
 * controlled form (Zod + controlled state, D-035) and the footer can gate "Next" on validity.
 */
export default function CheckoutPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);
  const discount = useCartStore(selectDiscount);
  const clear = useCartStore((state) => state.clear);

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<CustomerData>(emptyCustomer);
  const [address, setAddress] = useState<AddressData>(emptyAddress);
  const [customerTouched, setCustomerTouched] = useState<Set<keyof CustomerData>>(new Set());
  const [addressTouched, setAddressTouched] = useState<Set<keyof AddressData>>(new Set());
  const [deliveryId, setDeliveryId] = useState("");
  const [paymentId, setPaymentId] = useState<PaymentMethodId>("cod");
  const [proofUrl, setProofUrl] = useState("");
  const [proofTouched, setProofTouched] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const stepRef = useRef<HTMLDivElement>(null);

  const governoratesQuery = useQuery({
    queryKey: ["checkout", "governorates"],
    queryFn: ({ signal }) => listGovernorates(signal),
    staleTime: 60 * 60 * 1000,
  });
  const shippingQuery = useQuery({
    queryKey: ["checkout", "shipping-options"],
    queryFn: ({ signal }) => getShippingOptions(signal),
    staleTime: 60 * 60 * 1000,
  });
  const paymentQuery = useQuery({
    queryKey: ["checkout", "payment-methods"],
    queryFn: ({ signal }) => getPaymentMethods(signal),
    staleTime: 60 * 60 * 1000,
  });

  const governorates = useMemo(() => governoratesQuery.data ?? [], [governoratesQuery.data]);
  const shippingOptions = useMemo(() => shippingQuery.data ?? [], [shippingQuery.data]);
  const paymentMethods = useMemo(() => paymentQuery.data ?? [], [paymentQuery.data]);
  const isLoading =
    governoratesQuery.isLoading || shippingQuery.isLoading || paymentQuery.isLoading;
  const hasError = governoratesQuery.isError || shippingQuery.isError || paymentQuery.isError;

  useEffect(() => {
    if (deliveryId === "" && shippingOptions.length > 0) {
      setDeliveryId(shippingOptions[0]?.id ?? "");
    }
  }, [deliveryId, shippingOptions]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethods.some((method) => method.id === paymentId)) {
      setPaymentId(paymentMethods[0]?.id ?? "cod");
    }
  }, [paymentMethods, paymentId]);

  useEffect(() => {
    stepRef.current?.focus();
  }, [step]);

  useDocumentMeta(t("checkout.meta.title"), t("checkout.meta.description"));

  const selectedDelivery = shippingOptions.find((option) => option.id === deliveryId);
  const selectedPayment = paymentMethods.find((method) => method.id === paymentId);
  const shippingFee = (() => {
    if (coupon?.freeShipping === true || selectedDelivery === undefined) return 0;
    if (selectedDelivery.freeAbove !== undefined && subtotal >= selectedDelivery.freeAbove)
      return 0;
    return selectedDelivery.fee;
  })();
  const total = Math.round((subtotal + shippingFee - discount) * 100) / 100;

  const governorate = governorates.find((item) => item.value === address.governorate);
  const governorateLabel =
    governorate === undefined ? address.governorate : localize(governorate.name, locale);

  const customerErrors = collectTouchedErrors(
    customerSchema,
    customer,
    customerTouched,
    (field) => `checkout.customer.errors.${field}`,
    (key) => t(key),
  );

  const addressErrors = collectTouchedErrors(
    addressSchema,
    address,
    addressTouched,
    (field) => `checkout.address.errors.${field}`,
    (key) => t(key),
  );

  const proofError =
    proofTouched && !isValid(paymentProofSchema, proofUrl)
      ? t("checkout.payment.proofError")
      : undefined;

  const canProceed = (() => {
    if (step === 0) return isValid(customerSchema, customer);
    if (step === 1) return isValid(addressSchema, address);
    if (step === 2) return deliveryId !== "";
    if (step === 3) return isValid(paymentProofSchema, proofUrl);
    return true;
  })();

  const goBack = (): void => setStep((current) => Math.max(current - 1, 0));
  const goNext = (): void => setStep((current) => Math.min(current + 1, STEP_IDS.length - 1));
  const goTo = (index: number): void => {
    if (index < step) setStep(index);
  };

  const handlePlaceOrder = async (): Promise<void> => {
    setPlaceError(null);
    setIsPlacing(true);
    try {
      const order = await createOrder(
        buildOrderInput({
          customer,
          address,
          deliveryOptionId: deliveryId,
          paymentMethod: paymentId,
          proofUrl,
          items,
          couponCode: coupon?.code,
        }),
      );
      clear();
      navigate(ROUTES.orderSuccess(order.id), { replace: true });
    } catch (error) {
      setPlaceError(
        error instanceof OrderError
          ? t(`checkout.errors.${error.code}`)
          : t("checkout.errors.generic"),
      );
      setIsPlacing(false);
    }
  };

  if (count === 0 && !isPlacing) {
    return <Navigate to={ROUTES.cart} replace />;
  }

  const stepLabels = [
    t("checkout.steps.customer"),
    t("checkout.steps.address"),
    t("checkout.steps.delivery"),
    t("checkout.steps.payment"),
    t("checkout.steps.review"),
  ];
  const steps = STEP_IDS.map((id, index) => ({ id, label: stepLabels[index] ?? "" }));

  return (
    <div className="container-page pb-16 pt-6 lg:pb-20">
      <header className="border-b border-line pb-6">
        <h1 className="font-heading text-heading">{t("checkout.title")}</h1>
      </header>

      <CheckoutStepper
        steps={steps}
        current={step}
        label={t("checkout.stepperLabel")}
        onSelect={goTo}
        className="mt-8"
      />

      <p className="mt-4 text-sm text-fg-muted" aria-live="polite">
        {t("checkout.stepOf", { current: step + 1, total: STEP_IDS.length })}
      </p>

      {hasError ? (
        <div className="mt-8 space-y-3" role="alert">
          <p className="text-fg-muted">{t("common.error")}</p>
          <Button
            variant="secondary"
            onClick={() => {
              void governoratesQuery.refetch();
              void shippingQuery.refetch();
              void paymentQuery.refetch();
            }}
          >
            {t("common.retry")}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="mt-8 max-w-xl space-y-4" aria-busy="true">
          <p className="text-sm text-fg-muted">{t("common.loading")}</p>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <div ref={stepRef} tabIndex={-1} className="mt-8 max-w-xl focus:outline-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion === true ? 0 : 0.25 }}
              >
                <CheckoutStepView
                  step={step}
                  customer={customer}
                  customerErrors={customerErrors}
                  onCustomerChange={(patch) => setCustomer((c) => ({ ...c, ...patch }))}
                  onCustomerBlur={(field) => setCustomerTouched((prev) => new Set(prev).add(field))}
                  address={address}
                  addressErrors={addressErrors}
                  onAddressChange={(patch) => setAddress((c) => ({ ...c, ...patch }))}
                  onAddressBlur={(field) => setAddressTouched((prev) => new Set(prev).add(field))}
                  governorates={governorates}
                  deliveryId={deliveryId}
                  onDeliveryChange={setDeliveryId}
                  shippingOptions={shippingOptions}
                  subtotal={subtotal}
                  paymentMethods={paymentMethods}
                  paymentId={paymentId}
                  onPaymentChange={setPaymentId}
                  proofUrl={proofUrl}
                  proofError={proofError}
                  onProofChange={setProofUrl}
                  onProofBlur={() => setProofTouched(true)}
                  items={items}
                  governorateLabel={governorateLabel}
                  selectedDelivery={selectedDelivery}
                  selectedPayment={selectedPayment}
                  discount={discount}
                  shippingFee={shippingFee}
                  total={total}
                  onEdit={goTo}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <CheckoutFooter
            step={step}
            stepCount={STEP_IDS.length}
            canProceed={canProceed}
            isPlacing={isPlacing}
            placeError={placeError}
            onBack={goBack}
            onNext={goNext}
            onPlaceOrder={() => void handlePlaceOrder()}
          />
        </>
      )}
    </div>
  );
}
