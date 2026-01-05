import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import type { CardServCurrency } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();

    if (!orderMerchantId) {
      return NextResponse.json(
        { ok: false, error: "Missing orderMerchantId" },
        { status: 400 }
      );
    }

    // 1️⃣ Беремо замовлення з БД
    const order = await db.order.findFirst({
      where: { orderMerchantId },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Витягуємо валюту (ОБОВʼЯЗКОВО)
    // Validate currency - use EUR as fallback if invalid
    const currency: CardServCurrency = 
      (order.currency === "EUR" || order.currency === "USD" || order.currency === "GBP")
        ? (order.currency as CardServCurrency)
        : "EUR";

    // 3️⃣ Коректний виклик
    const status = await getCardServStatus(orderMerchantId, currency);

    // 4️⃣ Оновлюємо статус замовлення
    await db.order.updateMany({
      where: { orderMerchantId },
      data: {
        status: status.orderState,
        response: status.raw,
      },
    });

    // 5️⃣ Якщо платіж успішний — зараховуємо токени
    if (status.orderState === "APPROVED") {
      const userEmail = order.userEmail ?? undefined;

      if (userEmail) {
        const user = await db.user.findUnique({
          where: { email: userEmail },
        });

        if (user) {
          const tokens = order.tokens ?? 0;
          const newBalance = user.tokenBalance + tokens;

          await db.user.update({
            where: { id: user.id },
            data: { tokenBalance: newBalance },
          });

          // Ledger
          await db.ledgerEntry.create({
            data: {
              userId: user.id,
              type: "Top-up",
              delta: tokens,
              balanceAfter: newBalance,
              currency,
              amount: Math.round(order.amount * 100),
              receiptUrl: `order:${orderMerchantId}`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      state: status.orderState,
    });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
