import { NextResponse } from 'next/server';
import { syncCardServOrder } from '@/lib/payment';

function getAppUrl(request: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.VERCEL_URL;

  if (!configured) {
    return new URL('/', request.url).origin;
  }

  return configured.startsWith('http') ? configured : `https://${configured}`;
}

function getOrderMerchantId(request: Request, form: FormData) {
  const { searchParams } = new URL(request.url);

  return (
    form.get('MD')?.toString() ||
    form.get('threeDSSessionData')?.toString() ||
    searchParams.get('order') ||
    searchParams.get('orderId') ||
    searchParams.get('orderMerchantId') ||
    form.get('order')?.toString() ||
    form.get('orderId')?.toString() ||
    null
  );
}

function buildProcessingRedirect(appUrl: string, orderMerchantId: string | null) {
  if (!orderMerchantId) {
    return `${appUrl}/payment/processing`;
  }

  return `${appUrl}/payment/processing?order=${encodeURIComponent(orderMerchantId)}`;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const appUrl = getAppUrl(request);
    const orderMerchantId = getOrderMerchantId(request, form);

    if (orderMerchantId) {
      try {
        await syncCardServOrder(orderMerchantId);
      } catch (error) {
        console.error('[CARDSERV_RESULT_SYNC_ERROR]', error);
      }
    }

    return NextResponse.redirect(buildProcessingRedirect(appUrl, orderMerchantId), 302);
  } catch (error) {
    console.error('[CARDSERV_RESULT_POST_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appUrl = getAppUrl(request);
  const orderMerchantId =
    searchParams.get('order') ||
    searchParams.get('orderId') ||
    searchParams.get('orderMerchantId');

  return NextResponse.redirect(buildProcessingRedirect(appUrl, orderMerchantId), 302);
}
