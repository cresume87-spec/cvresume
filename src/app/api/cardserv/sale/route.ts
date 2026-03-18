import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCardServOrder } from '@/lib/cardserv';
import { isAllowedCountryCode } from '@/lib/countries';
import { pickRedirectUrl } from '@/lib/pickRedirectUrl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderMerchantId = `order_${Date.now()}`;

    const chargedAmount =
      typeof body.total === 'number' && Number.isFinite(body.total)
        ? body.total
        : body.amount;

    const countryCodeRaw =
      typeof body.countryCode === 'string'
        ? body.countryCode
        : typeof body.card?.countryCode === 'string'
        ? body.card.countryCode
        : '';
    const countryCode = countryCodeRaw.toUpperCase();

    if (!isAllowedCountryCode(countryCode)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported billing country' },
        { status: 400 },
      );
    }

    const sale = await createCardServOrder({
      ...body,
      amount: chargedAmount,
      orderMerchantId,
      countryCode,
    });

    const statusData = sale.raw?.status;
    const saleData = sale.raw?.sale;
    const redirectUrl = sale.redirectUrl || pickRedirectUrl(statusData) || pickRedirectUrl(saleData);

    await db.order.create({
      data: {
        userEmail: body.email,
        amount: chargedAmount,
        currency: body.currency,
        description: body.description,
        tokens: body.tokens ?? 0,
        orderMerchantId,
        orderSystemId: sale.orderSystemId,
        status: sale.orderState,
        response: sale.raw,
      },
    });

    const hardFailure =
      !redirectUrl &&
      !sale.threeDSAuth &&
      ['UNKNOWN', 'ERROR', 'DECLINED'].includes(sale.orderState) &&
      sale.orderSystemId == null;

    return NextResponse.json(
      {
        ok: !hardFailure,
        orderMerchantId,
        orderSystemId: sale.orderSystemId ?? null,
        state: sale.orderState,
        redirectUrl,
        threeDSAuth: sale.threeDSAuth,
        raw: sale.raw,
        errorCode: sale.errorCode ?? null,
        errorMessage: sale.errorMessage ?? null,
        transientNotFound:
          sale.orderState === 'UNKNOWN' && Number(statusData?.errorCode) === -27,
      },
      { status: hardFailure ? 502 : 200 },
    );
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    const message = rawMessage.includes('906 Cannot validate session')
      ? 'CardServ rejected this card or session. Please try another card.'
      : rawMessage;

    console.error('[CARDSERV_SALE_ERROR]', rawMessage);
    return NextResponse.json(
      { ok: false, error: message, rawError: rawMessage },
      { status: 500 },
    );
  }
}
