"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentProcessingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking payment...");

  useEffect(() => {
    const paramId =
      params.get("order") ||
      params.get("orderId") ||
      params.get("orderMerchantId");

    const storedId =
      typeof window !== "undefined"
        ? localStorage.getItem("orderMerchantId")
        : null;

    const finalId = paramId || storedId;

    if (finalId) {
      setOrderId(finalId);
      return;
    }

    setStatus("failed");
    setMessage("Order ID not found.");
  }, [params]);

  useEffect(() => {
    if (!orderId) return;

    async function checkStatus() {
      try {
        const response = await fetch("/api/payment/credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderMerchantId: orderId }),
        });
        const data = (await response.json()) as { state?: string };

        if (data.state === "APPROVED") {
          setStatus("approved");
          setMessage("Payment successful.");
          localStorage.removeItem("orderMerchantId");
          window.setTimeout(() => router.push("/dashboard"), 2000);
          return;
        }

        if (data.state === "PROCESSING") {
          setStatus("pending");
          setMessage("Processing payment...");
          window.setTimeout(checkStatus, 2500);
          return;
        }

        setStatus("failed");
        setMessage("Payment failed or was cancelled.");
        localStorage.removeItem("orderMerchantId");
      } catch (error) {
        console.error("Error checking payment:", error);
        setStatus("failed");
        setMessage("Error while checking payment.");
        localStorage.removeItem("orderMerchantId");
      }
    }

    void checkStatus();
  }, [orderId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h2 className="mb-2 text-2xl font-semibold">Payment Status</h2>
        <p className="mb-3">{message}</p>
        {orderId ? (
          <p className="text-xs text-gray-500">
            Order ID: <b>{orderId}</b>
          </p>
        ) : null}
        {status === "pending" ? (
          <div className="mt-4 text-sm text-gray-500">
            Do not close this page while we check the transaction.
          </div>
        ) : null}
      </div>
    </div>
  );
}
