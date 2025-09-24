import { authOptions } from "@/lib/auth";
import { pricingPlans } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse("Unauthorized", { status: 401 });

    const { planId, currency, customAmount } = await req.json();

    let line_items;

    if (planId) {
      // Логика для стандартных планов
      const plan = pricingPlans.find((p) => p.id === planId);
      if (!plan) return new NextResponse("Plan not found", { status: 404 });

      const priceInCents =
        currency === "GBP" ? plan.baseGBP * 100 : plan.baseEUR * 100;
      line_items = [
        {
          price_data: {
            currency,
            product_data: { name: plan.name },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ];
    } else if (customAmount && customAmount >= 5) {
      // Логика для кастомной суммы
      line_items = [
        {
          price_data: {
            currency,
            product_data: { name: "Custom Token Top-up" },
            unit_amount: customAmount * 100,
          },
          quantity: 1,
        },
      ];
    } else {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error("STRIPE_SECRET_KEY is missing.");
      return new NextResponse("Payment processor not configured", { status: 503 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email || undefined,
      line_items,
      metadata: {
        userId: session.user.id,
        // Считаем токены для кастомной суммы, 100 токенов за 1 GBP/EUR
        tokens: planId
          ? pricingPlans.find((p) => p.id === planId)!.tokens
          : customAmount * 100,
      },
      success_url: `https://www.invoicerly.co.uk/dashboard?payment=success`,
      cancel_url: `https://www.invoicerly.co.uk/pricing?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

