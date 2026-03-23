import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import { isBypassedGatewayResponse } from "@/lib/paymentMode";
import { pickRedirectUrl } from "@/lib/pickRedirectUrl";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();

    console.log("[STATUS CHECK START]", orderMerchantId);

    const order = await db.order.findFirst({ where: { orderMerchantId } });
    if (!order) {
      console.log("[STATUS] ORDER NOT FOUND");
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    if (isBypassedGatewayResponse(order.response)) {
      const response = {
        ok: true,
        orderMerchantId,
        orderSystemId: order.orderSystemId ?? null,
        state: "APPROVED",
        redirectUrl: null,
        threeDSAuth: null,
        raw: order.response,
        errorCode: null,
        errorMessage: null,
        transientNotFound: false,
      };

      console.log("[STATUS] Returning bypassed payment state", response);
      return NextResponse.json(response);
    }

    const status = await getCardServStatus(
      orderMerchantId,
      order.currency,
      order.orderSystemId,
    );

    const redirectUrl = status.redirectUrl || pickRedirectUrl(status.raw);

    const existingResponse =
      order.response && typeof order.response === "object"
        ? (order.response as Record<string, unknown>)
        : {};

    await db.order.update({
      where: { id: order.id },
      data: {
        status: status.orderState,
        response: {
          ...existingResponse,
          status: status.raw,
        },
      },
    });

    const response = {
      ok: true,
      orderMerchantId,
      orderSystemId: status.orderSystemId ?? order.orderSystemId ?? null,
      state: status.orderState,
      redirectUrl,
      threeDSAuth: status.threeDSAuth,
      raw: status.raw,
      errorCode: status.errorCode ?? null,
      errorMessage: status.errorMessage ?? null,
      transientNotFound:
        status.orderState === "UNKNOWN" && Number(status.raw?.errorCode) === -27,
    };

    console.log("[STATUS RESPONSE]", response);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[STATUS ERROR]", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
