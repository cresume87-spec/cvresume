"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Section from "@/components/layout/Section";
import { convertToTokens, convertTokensToCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currencyPreference";
import { PRICING_PLANS } from "@/lib/data";
import PlanCard from "@/components/pricing/PlanCard";
import CustomPlanCard from "@/components/pricing/CustomPlanCard";

type PricingPlanSelection = {
  name: string;
  gbpAmount: number;
};

function parsePlanAmount(price: string) {
  const amount = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

export default function PricingClient() {
  const [currency] = usePreferredCurrency();
  const { status, data: session } = useSession();
  const router = useRouter();
  const signedIn = status === "authenticated";

  const handlePlanRequest = (plan: PricingPlanSelection) => {
    if (!signedIn) {
      router.push("/auth/signin?mode=login");
      return;
    }

    const tokens = convertToTokens(plan.gbpAmount, "GBP").tokens;
    const convertedAmount = convertTokensToCurrency(tokens, currency);

    // AUD/CAD/NZD are display-only currencies. CardServ checkout still uses GBP.
    const displayOnlyCurrency = currency === "AUD" || currency === "CAD" || currency === "NZD";
    const checkoutCurrency = displayOnlyCurrency ? "GBP" : currency;
    const checkoutAmount = displayOnlyCurrency ? plan.gbpAmount : convertedAmount;

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
        </div>

        <div className="mt-10 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => {
            const gbpAmount = parsePlanAmount(plan.price);
            const tokens = convertToTokens(gbpAmount, "GBP").tokens;
            const displayAmount = convertTokensToCurrency(tokens, currency);

            return (
              <PlanCard
                key={plan.name}
                name={plan.name}
                popular={plan.popular}
                bullets={plan.points}
                cta="Choose Plan"
                amount={displayAmount}
                currency={currency}
                tokens={tokens}
                onAction={() => handlePlanRequest({ name: plan.name, gbpAmount })}
              />
            );
          })}
          <CustomPlanCard
            currency={currency}
            onRequest={(customAmount) =>
              handlePlanRequest({
                name: "Custom",
                gbpAmount: convertToTokens(customAmount, currency).gbpEquivalent,
              })
            }
          />
        </div>
      </Section>
    </div>
  );
}
