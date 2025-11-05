import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";

// /app/api/cardserv/sale/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔹 створюємо orderMerchantId на цьому рівні, щоб передати його в CardServ із resultUrl
    const orderMerchantId = `order_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // 🔹 додаємо URL для редіректів
    const resultUrl = `${appUrl}/api/cardserv/result?order=${orderMerchantId}`;
    const returnUrl = `${appUrl}/payment/processing?order=${orderMerchantId}`;

    // 🔹 передаємо orderMerchantId і URL у createCardServOrder
    const sale = await createCardServOrder({
      ...body,
      orderMerchantId,
      urls: { resultUrl, returnUrl },
    });

    // 🔹 зберігаємо замовлення у базі
    await db.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        tokens: body.tokens || 0,
        orderMerchantId,
        orderSystemId: sale.orderSystemId ? String(sale.orderSystemId) : null,
        status: sale.orderState,
        response: sale.raw,
      },
    });

    // 🔹 якщо шлюз повернув редірект — віддаємо його на фронт
    if (sale.redirectUrl) {
      return NextResponse.json({
        ok: true,
        redirectUrl: sale.redirectUrl,
        orderMerchantId,
      });
    }

    // 🔹 якщо потрібно відкрити 3DS ACS форму (PaReq або CReq)
    if (sale.threeDSAuth?.acsUrl && (sale.threeDSAuth?.paReq || sale.threeDSAuth?.creq)) {
      return NextResponse.json({
        ok: true,
        orderMerchantId,
        threeDS: {
          acsUrl: sale.threeDSAuth.acsUrl,
          paReq: sale.threeDSAuth.paReq || null,
          creq: sale.threeDSAuth.creq || null,
        },
      });
    }

    // 🔹 fallback — просто статус
    return NextResponse.json({
      ok: true,
      orderMerchantId,
      state: sale.orderState,
    });
  } catch (err: any) {
    console.error("❌ CardServ Sale Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
