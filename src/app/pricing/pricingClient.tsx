"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Section from "@/components/layout/Section";
import { Currency } from "@/lib/currency";
import {
  convertToTokens,
  convertTokensToCurrency,
} from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currencyPreference";
import { PRICING_PLANS } from "@/lib/data";
import PlanCard from "@/components/pricing/PlanCard";
import CustomPlanCard from "@/components/pricing/CustomPlanCard";

type PricingPlanSelection = {
  name: string;
  price: string;
};

export default function PricingClient() {
  const [currency, setCurrency] = usePreferredCurrency();
  const { status, data: session } = useSession();
  const router = useRouter();
  const signedIn = status === "authenticated";

  const handlePlanRequest = (plan: PricingPlanSelection) => {
    if (!signedIn) {
      router.push("/auth/signin?mode=login");
      return;
    }

    const gbpAmount = parseFloat(plan.price.replace(/[£,]/g, ""));
    const tokens = convertToTokens(gbpAmount, "GBP").tokens;
    const convertedAmount = convertTokensToCurrency(tokens, currency);

    // For AUD/CAD/NZD: convert to GBP for checkout (CardServ doesn't support them)
    const displayOnlyCurrency = currency === "AUD" || currency === "CAD" || currency === "NZD";
    const checkoutCurrency = displayOnlyCurrency ? "GBP" : currency;
    const checkoutAmount = displayOnlyCurrency ? gbpAmount : convertedAmount;

    const checkoutData = {
      email: session?.user?.email || "",
      planId: plan.name,
      description: `Top-up: ${plan.name}`,
      amount: checkoutAmount,
      currency: checkoutCurrency,
      displayCurrency: currency,
      displayAmount: convertedAmount,
      tokens,
      vatRate: 0,
      vatAmount: 0,
      total: checkoutAmount,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Section className="py-12">
        <div className="text-center">
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold">Top-Up</h1>
          <p className="mt-2 text-slate-600">
            Choose a plan and proceed to secure checkout.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="NZD">NZD (NZ$)</option>
            </select>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              popular={plan.popular}
              bullets={plan.points}
              cta="Choose Plan"
              amount={parseFloat(plan.price.replace(/[£,]/g, ""))}
              currency={currency}
              onAction={() => handlePlanRequest(plan)}
            />
          ))}
          <CustomPlanCard
            currency={currency}
            onRequest={() => handlePlanRequest({ name: "Custom", price: "£5" })}
          />
        </div>
      </Section>
    </div>
  );
}
