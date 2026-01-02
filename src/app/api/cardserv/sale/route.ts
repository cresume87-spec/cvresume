import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";
import { pickRedirectUrl } from "@/lib/pickRedirectUrl";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderMerchantId = `order_${Date.now()}`;

    console.log("🟡 SALE START", orderMerchantId);

    const sale = await createCardServOrder({
      ...body,
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
