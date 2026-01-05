import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import type { CardServCurrency } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // 3DS поля
    const md = form.get("MD")?.toString(); // 3DS1
    const threeDSSessionData = form.get("threeDSSessionData")?.toString(); // 3DS2

    const orderMerchantId = md || threeDSSessionData;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (!orderMerchantId) {
      console.error("❌ Missing orderMerchantId in 3DS callback");
      return NextResponse.redirect(`${appUrl}/payment/processing`, 302);
    }

    // ✅ 1. Забираємо order з БД (ЦЕ КЛЮЧОВЕ)
    const order = await db.order.findFirst({
      where: { orderMerchantId },
    });

    if (!order) {
      console.error("❌ Order not found:", orderMerchantId);
      return NextResponse.redirect(
        `${appUrl}/payment/processing?order=${encodeURIComponent(orderMerchantId)}`,
        302
      );
    }

    // ✅ 2. Перевіряємо статус у CardServ (З ВАЛЮТОЮ)
    // Validate currency - use EUR as fallback if invalid
    const validatedCurrency: CardServCurrency = 
      (order.currency === "EUR" || order.currency === "USD" || order.currency === "GBP")
        ? (order.currency as CardServCurrency)
        : "EUR";

    const status = await getCardServStatus(
      orderMerchantId,
      validatedCurrency
    );


    // ✅ 3. Оновлюємо order
    await db.order.update({
      where: { id: order.id },
      data: {
        status: status.orderState,
        response: {
          ...(order.response as any),
          result: status.raw,
        },
      },
    });

    // ✅ 4. Якщо APPROVED → зараховуємо токени
    if (status.orderState === "APPROVED" && order.tokens && order.userEmail) {
      const user = await db.user.findUnique({
        where: { email: order.userEmail },
      });

      if (user) {
        const newBalance = user.tokenBalance + order.tokens;

        await db.user.update({
          where: { id: user.id },
          data: { tokenBalance: newBalance },
        });

        await db.ledgerEntry.create({
          data: {
            userId: user.id,
            type: "Top-up",
            delta: order.tokens,
            balanceAfter: newBalance,
            currency: order.currency,
            amount: Math.round(order.amount * 100),
          },
        });

        console.log(
          `✅ Tokens credited: ${user.email} +${order.tokens}`
        );
      }
    }

    // ✅ 5. Редірект користувача назад у frontend
    const redirectUrl = `${appUrl}/payment/processing?order=${encodeURIComponent(
      orderMerchantId
    )}`;

    console.log("🔁 Redirecting to:", redirectUrl);
    return NextResponse.redirect(redirectUrl, 302);
  } catch (err: any) {
    console.error("❌ /api/cardserv/result POST error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

// 🔹 fallback якщо CardServ робить GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/payment/processing`, 302);
  }

  const redirectUrl = `${appUrl}/payment/processing?order=${encodeURIComponent(
    orderId
  )}`;

  return NextResponse.redirect(redirectUrl, 302);
}
