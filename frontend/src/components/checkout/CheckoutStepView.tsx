import { AddressStep } from "@/components/checkout/AddressStep";
import { CustomerStep } from "@/components/checkout/CustomerStep";
import { DeliveryStep } from "@/components/checkout/DeliveryStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import type { AddressData, CustomerData } from "@/components/checkout/checkoutSchemas";
import type { CartItem } from "@/store/cartStore";
import type {
  Governorate,
  PaymentMethod,
  PaymentMethodId,
  ShippingOption,
} from "@/services/types";

export interface CheckoutStepViewProps {
  step: number;
  customer: CustomerData;
  customerErrors: Partial<Record<keyof CustomerData, string>>;
  onCustomerChange: (patch: Partial<CustomerData>) => void;
  onCustomerBlur: (field: keyof CustomerData) => void;
  address: AddressData;
  addressErrors: Partial<Record<keyof AddressData, string>>;
  onAddressChange: (patch: Partial<AddressData>) => void;
  onAddressBlur: (field: keyof AddressData) => void;
  governorates: Governorate[];
  deliveryId: string;
  onDeliveryChange: (id: string) => void;
  shippingOptions: ShippingOption[];
  subtotal: number;
  paymentMethods: PaymentMethod[];
  paymentId: PaymentMethodId;
  onPaymentChange: (id: PaymentMethodId) => void;
  proofUrl: string;
  proofError: string | undefined;
  onProofChange: (url: string) => void;
  onProofBlur: () => void;
  items: CartItem[];
  governorateLabel: string;
  selectedDelivery: ShippingOption | undefined;
  selectedPayment: PaymentMethod | undefined;
  discount: number;
  shippingFee: number;
  total: number;
  onEdit: (step: number) => void;
}

/** Renders whichever step is active. Keeps `CheckoutPage` within the one-component-per-file rule. */
export function CheckoutStepView(props: CheckoutStepViewProps) {
  switch (props.step) {
    case 0:
      return (
        <CustomerStep
          value={props.customer}
          onChange={props.onCustomerChange}
          errors={props.customerErrors}
          onBlur={props.onCustomerBlur}
        />
      );
    case 1:
      return (
        <AddressStep
          value={props.address}
          onChange={props.onAddressChange}
          errors={props.addressErrors}
          onBlur={props.onAddressBlur}
          governorates={props.governorates}
        />
      );
    case 2:
      return (
        <DeliveryStep
          options={props.shippingOptions}
          value={props.deliveryId}
          onChange={props.onDeliveryChange}
          subtotal={props.subtotal}
        />
      );
    case 3:
      return (
        <PaymentStep
          methods={props.paymentMethods}
          value={props.paymentId}
          onChange={props.onPaymentChange}
          proofUrl={props.proofUrl}
          onProofChange={props.onProofChange}
          proofError={props.proofError}
          onProofBlur={props.onProofBlur}
        />
      );
    default:
      return (
        <ReviewStep
          items={props.items}
          customer={props.customer}
          address={props.address}
          governorateLabel={props.governorateLabel}
          delivery={props.selectedDelivery}
          payment={props.selectedPayment}
          subtotal={props.subtotal}
          discount={props.discount}
          shippingFee={props.shippingFee}
          total={props.total}
          onEdit={props.onEdit}
        />
      );
  }
}

export default CheckoutStepView;
