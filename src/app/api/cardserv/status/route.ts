import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import { pickRedirectUrl } from "@/lib/pickRedirectUrl";
import type { CardServCurrency } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();

    console.log("🔁 STATUS CHECK:", orderMerchantId);

    const order = await db.order.findFirst({ where: { orderMerchantId } });
    if (!order) {
      console.log("❌ ORDER NOT FOUND");
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // Validate currency - use EUR as fallback if invalid
    const validatedCurrency: CardServCurrency = 
      (order.currency === "EUR" || order.currency === "USD" || order.currency === "GBP")
        ? (order.currency as CardServCurrency)
        : "EUR";

    const status = await getCardServStatus(
      orderMerchantId,
      validatedCurrency
    );

    console.log("🔵 STATUS RAW:", JSON.stringify(status.raw, null, 2));
    console.log("🔵 STATUS STATE:", status.orderState);

    const redirectUrl = pickRedirectUrl(status.raw);
    console.log("🔵 STATUS REDIRECT:", redirectUrl);

    await db.order.update({
      where: { id: order.id },
      data: {
        status: status.orderState,
        response: {
          ...(order.response as any),
          status: status.raw,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        orderMerchantId,
        state: status.orderState,
        redirectUrl,
      },
    });
  } catch (e: any) {
    console.error("❌ STATUS ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
