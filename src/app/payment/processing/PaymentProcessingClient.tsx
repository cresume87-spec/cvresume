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
      console.log("💾 Found orderMerchantId:", finalId);
      setOrderId(finalId);
    } else {
      setStatus("failed");
      setMessage("❌ Order ID not found.");
    }
  }, [params]);

  // 🧾 Перевіряємо статус
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

        if (data.state === "APPROVED") {
          setStatus("approved");
          setMessage("✅ Payment successful!");
          localStorage.removeItem("orderMerchantId");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else if (data.state === "PROCESSING") {
          setStatus("pending");
          setMessage("⏳ Processing...");
          setTimeout(checkStatus, 2500);
        } else {
          setStatus("failed");
          setMessage("❌ Payment failed or cancelled.");
        }
      } catch (err) {
        console.error("Error checking payment:", err);
        setStatus("failed");
        setMessage("Error while checking payment.");
      }
    }

    checkStatus();
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-2">Payment Status</h2>
        <p className="mb-3">{message}</p>
        {orderId && (
          <p className="text-xs text-gray-500">
            Order ID: <b>{orderId}</b>
          </p>
        )}
        {status === "pending" && (
          <div className="mt-4 text-gray-500 text-sm">
            Don’t close this page — checking transaction...
          </div>
        )}
      </div>
    </div>
  );
}
