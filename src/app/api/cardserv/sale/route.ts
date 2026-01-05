import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";
import { pickRedirectUrl } from "@/lib/pickRedirectUrl";
import type { CardServCurrency } from "@/lib/config";

// Validate currency to ensure it's a valid CardServCurrency
function validateCurrency(currency: any): CardServCurrency {
  if (currency === "EUR" || currency === "USD" || currency === "GBP") {
    return currency as CardServCurrency;
  }
  throw new Error(`Invalid currency: ${currency}. Supported currencies: EUR, USD, GBP`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderMerchantId = `order_${Date.now()}`;

    console.log("🟡 SALE START", orderMerchantId);

    // Validate currency before passing to createCardServOrder
    const validatedCurrency = validateCurrency(body.currency);

    const sale = await createCardServOrder({
      ...body,
      currency: validatedCurrency,
      orderMerchantId,
    });

    console.log("🟢 SALE RAW:", JSON.stringify(sale.raw, null, 2));
    console.log("🟢 SALE STATE:", sale.orderState);

    const redirectUrl = pickRedirectUrl(sale.raw?.status || sale.raw?.sale);

    console.log("🟢 SALE REDIRECT:", redirectUrl);

    await db.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        tokens: body.tokens ?? 0,
        orderMerchantId,
        orderSystemId: sale.orderSystemId,
        status: sale.orderState,
        response: sale.raw,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        orderMerchantId,
        state: sale.orderState,
        redirectUrl,
      },
    });
  } catch (e: any) {
    console.error("❌ SALE ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
