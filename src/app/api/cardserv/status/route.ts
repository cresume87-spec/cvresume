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
      // ✅ Додаємо токени користувачу
      const order = await db.order.findFirst({ where: { orderMerchantId } });
      if (order) {
        const userEmail = order.userEmail ?? undefined; // <-- виправлення тут
        const user = await db.user.findUnique({ where: { email: userEmail } });

        if (user) {
          const newBalance = user.tokenBalance + (order.tokens ?? 0);
          await db.user.update({
            where: { id: user.id },
            data: { tokenBalance: newBalance },
          });
        }
      }
    }

    return NextResponse.json({ ok: true, state: status.orderState });
  } catch (err: any) {
    console.error("CardServ Status Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
