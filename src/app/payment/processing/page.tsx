import { Suspense } from "react";
import PaymentProcessingClient from "./PaymentProcessingClient";

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading payment...</div>}>
      <PaymentProcessingClient />
    </Suspense>
  );
}
