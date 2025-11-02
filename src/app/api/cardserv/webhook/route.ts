import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();

    if (!orderMerchantId)
      return NextResponse.json({ ok: false, error: "Missing orderMerchantId" }, { status: 400 });

    const status = await getCardServStatus(orderMerchantId);

    await db.order.updateMany({
      where: { orderMerchantId },
      data: { status: status.orderState, response: status.raw },
    });

    if (status.orderState === "APPROVED") {
      const order = await db.order.findFirst({ where: { orderMerchantId } });
      if (order) {
        const userEmail = order.userEmail ?? undefined; // 🧩 Виправлення тут
        const user = await db.user.findUnique({ where: { email: userEmail } });

        if (user) {
          const newBalance = user.tokenBalance + (order.tokens ?? 0);
          await db.user.update({
            where: { id: user.id },
            data: { tokenBalance: newBalance },
          });

          // За бажанням — створення ledger-запису:
          await db.ledgerEntry.create({
            data: {
              userId: user.id,
              type: "Top-up",
              delta: order.tokens ?? 0,
              balanceAfter: newBalance,
              currency: order.currency === "EUR" ? "EUR" : "GBP",
              amount: Math.round(order.amount * 100),
              receiptUrl: `order:${orderMerchantId}`,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true, state: status.orderState });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
