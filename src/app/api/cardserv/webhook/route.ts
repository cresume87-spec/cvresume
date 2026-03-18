import { NextResponse } from 'next/server';
import { syncCardServOrder } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { orderMerchantId?: string } | null;
    const orderMerchantId = body?.orderMerchantId;

    if (!orderMerchantId) {
      return NextResponse.json(
        { ok: false, error: 'Missing orderMerchantId' },
        { status: 400 },
      );
    }

    const result = await syncCardServOrder(orderMerchantId);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[CARDSERV_WEBHOOK_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
