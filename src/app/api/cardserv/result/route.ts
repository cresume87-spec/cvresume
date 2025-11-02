import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";

// 🔹 CardServ викликає цей маршрут після 3DS
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const paRes = form.get("PaRes")?.toString();
    const md = form.get("MD")?.toString(); // 3DS1
    const cres = form.get("cres")?.toString(); // 3DS2
    const threeDSSessionData = form.get("threeDSSessionData")?.toString();

    // ✅ Витягуємо orderMerchantId з MD або threeDSSessionData
    const orderMerchantId = md || threeDSSessionData || "";

    if (!orderMerchantId) {
      console.error("❌ Missing orderMerchantId in 3DS result callback");
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      return NextResponse.redirect(`${appUrl}/payment/processing`, 302);
    }

    // 🧠 Перевіряємо статус транзакції на шлюзі
    const status = await getCardServStatus(orderMerchantId);

    await db.order.updateMany({
      where: { orderMerchantId },
      data: {
        status: status.orderState,
        response: status.raw,
      },
    });

    if (status.orderState === "APPROVED") {
      // ✅ Зараховуємо токени користувачу
      const order = await db.order.findFirst({ where: { orderMerchantId } });
      if (order && order.userEmail) {
        const user = await db.user.findUnique({
          where: { email: order.userEmail },
        });
        if (user) {
          const newBalance = user.tokenBalance + (order.tokens ?? 0);

          await db.user.update({
            where: { id: user.id },
            data: { tokenBalance: newBalance },
          });

          await db.ledgerEntry.create({
            data: {
              userId: user.id,
              type: "Top-up",
              delta: order.tokens ?? 0,
              balanceAfter: newBalance,
              currency: order.currency === "EUR" ? "EUR" : "GBP",
              amount: Math.round(order.amount * 100),
            },
          });

          console.log(`✅ Tokens credited for ${user.email}: +${order.tokens}`);
        }
      }
    }

    // 🔁 Редіректимо користувача на frontend сторінку
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const redirectUrl = `${appUrl}/payment/processing?order=${encodeURIComponent(orderMerchantId)}`;

    console.log("🔁 Redirecting user to:", redirectUrl);
    return NextResponse.redirect(redirectUrl, 302);
  } catch (err: any) {
    console.error("❌ /api/cardserv/result error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// 🔹 fallback якщо CardServ викликає GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!orderId) {
    console.log("⚠️ Missing order param in GET, redirecting to generic page");
    return NextResponse.redirect(`${appUrl}/payment/processing`, 302);
  }

  const redirectUrl = `${appUrl}/payment/processing?order=${encodeURIComponent(orderId)}`;
  console.log("🔁 Redirect (GET):", redirectUrl);
  return NextResponse.redirect(redirectUrl, 302);
}
