import { getCardServConfig, CardServCurrency } from "./config";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function createCardServOrder(payload: {
  orderMerchantId: string;
  amount: number;
  currency: CardServCurrency;
  description?: string;
  email: string;
  card: {
    cardNumber: string;
    cvv: string;
    expiry: string; // MM/YY
    name: string;
  };
  address?: string;
  city?: string;
  postalCode?: string;
}) {
  const cfg = getCardServConfig(payload.currency);

  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    "Content-Type": "application/json",
  };

  const saleUrl   = `${cfg.BASE_URL}/api/payments/sale/${cfg.requestorId}`;
  const statusUrl = `${cfg.BASE_URL}/api/payments/status/${cfg.requestorId}`;

  const [expMonth, expYearShort] = payload.card.expiry.split("/");

  const body = {
    order: {
      orderMerchantId: payload.orderMerchantId,
      orderDescription: payload.description || "Payment",
      orderAmount: payload.amount.toFixed(2),
      orderCurrencyCode: cfg.currency,
      challengeIndicator: "01", // ✅ ВАЖЛИВО
    },

    browser: {
      ipAddress: "8.8.8.8",
      acceptHeader:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      colorDepth: 32,
      javascriptEnabled: "true", // ✅ STRING
      acceptLanguage: "en-US",
      screenHeight: 1080,
      screenWidth: 1920,
      timeZone: 0,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome Safari",
      javaEnabled: "false", // ✅ STRING
    },

    customer: {
      firstname: payload.card.name.split(" ")[0] || "John",
      lastname: payload.card.name.split(" ")[1] || "Doe",
      customerEmail: payload.email,
      address: {
        countryCode: cfg.country, // GB / DE / US
        zipCode: payload.postalCode || "SW1A1AA",
        city: payload.city || "London",
        line1: payload.address || "10 Downing Street",
      },
    },

    card: {
      cardNumber: payload.card.cardNumber.replace(/\s/g, ""),
      cvv2: payload.card.cvv,
      expireMonth: expMonth,
      expireYear: expYearShort, // ❗ "26", НЕ "2026"
      cardPrintedName: payload.card.name,
    },

    urls: {
      resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/processing?order=${encodeURIComponent(payload.orderMerchantId)}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/cardserv/webhook`,
    },
  };

  console.log("🟡 SALE PAYLOAD:", JSON.stringify(body, null, 2));

  // 1️⃣ SALE
  const saleRes = await fetch(saleUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const saleData = JSON.parse(await saleRes.text());

  // 2️⃣ POLLING STATUS (як у прикладі)
  let statusData = saleData;

  for (let i = 0; i < 2; i++) {
    await sleep(i === 0 ? 1200 : 1800);

    const r = await fetch(statusUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        orderMerchantId: payload.orderMerchantId,
        orderSystemId: saleData?.orderSystemId,
      }),
    });

    statusData = JSON.parse(await r.text());

    if (
      statusData?.outputRedirectToUrl ||
      statusData?.redirectData?.redirectUrl ||
      ["APPROVED", "DECLINED", "ERROR"].includes(statusData?.orderState)
    ) {
      break;
    }
  }

  return {
    orderMerchantId: payload.orderMerchantId,
    orderSystemId:
      statusData?.orderSystemId
        ? String(statusData.orderSystemId)
        : null,
    orderState: statusData?.orderState ?? "PROCESSING",
    raw: {
      sale: saleData,
      status: statusData,
    },
  };
}

/* ===================== STATUS ===================== */
export async function getCardServStatus(
  orderMerchantId: string,
  currency: CardServCurrency
) {
  const cfg = getCardServConfig(currency);

  const res = await fetch(
    `${cfg.BASE_URL}/api/payments/status/${cfg.requestorId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderMerchantId }),
    }
  );

  const data = JSON.parse(await res.text());

  return {
    orderSystemId: data?.orderSystemId
      ? String(data.orderSystemId)
      : null,
    orderState: data?.orderState ?? "PROCESSING",
    redirectUrl: data?.outputRedirectToUrl ?? null,
    threeDSAuth: data?.threeDSAuth ?? null,
    raw: data,
  };
}
