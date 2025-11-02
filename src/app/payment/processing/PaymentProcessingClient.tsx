"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentProcessingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking payment...");

  // 🟢 Отримуємо orderMerchantId
  useEffect(() => {
    const urlParam =
      params.get("order") ||
      params.get("orderId") ||
      params.get("orderMerchantId");

    const fromStorage =
      typeof window !== "undefined"
        ? localStorage.getItem("orderMerchantId")
        : null;

    const finalOrderId = urlParam || fromStorage;

    if (finalOrderId) {
      console.log("💾 Using orderMerchantId:", finalOrderId);
      setOrderId(finalOrderId);
    } else {
      setStatus("failed");
      setMessage("❌ Order ID not found.");
    }
  }, [params]);

  // 🟢 Перевірка статусу платежу
  useEffect(() => {
    if (!orderId) return;

    async function checkStatus() {
      try {
        const res = await fetch("/api/payment/credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderMerchantId: orderId }),
        });

        const data = await res.json();
        console.log("🧾 Payment status:", data);

        if (data?.state === "APPROVED") {
          setStatus("approved");
          setMessage("✅ Payment successful! Tokens credited.");

          try {
            const bc = new BroadcastChannel("app-events");
            bc.postMessage({
              type: "tokens-updated",
              tokenBalance: data.tokenBalance,
            });
          } catch {}

          localStorage.removeItem("orderMerchantId");
          setTimeout(() => router.push("/dashboard"), 2500);
        } else if (data?.state === "PROCESSING" || !data?.state) {
          setStatus("pending");
          setMessage("⏳ Processing... please wait");
          setTimeout(checkStatus, 3000);
        } else {
          setStatus("failed");
          setMessage("❌ Payment failed or cancelled.");
        }
      } catch (err) {
        console.error("❌ Error checking status:", err);
        setStatus("failed");
        setMessage("Error while checking payment status.");
      }
    }

    checkStatus();
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-4">Payment Status</h2>
        <p>{message}</p>
        {status === "pending" && (
          <div className="mt-4 text-gray-500 text-sm">
            Don’t close this page — checking transaction...
          </div>
        )}
      </div>
    </div>
  );
}
