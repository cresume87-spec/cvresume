import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";
import { isWithoutPaymentEnabled } from "@/lib/paymentMode";

export default function CheckoutPage() {
  const withoutPayment = isWithoutPaymentEnabled();

  return (
    <Suspense fallback={<div className="p-10 text-center">Loading checkout...</div>}>
      <CheckoutClient withoutPayment={withoutPayment} />
    </Suspense>
  );
}
