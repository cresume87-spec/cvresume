import { randomUUID } from "crypto";

export async function getCardServStatus(orderMerchantId: string) {
  const { CARDSERV_BASE_URL, CARDSERV_REQUESTOR_ID, CARDSERV_BEARER_TOKEN } = process.env;
  const url = `${CARDSERV_BASE_URL}/api/payments/status/${CARDSERV_REQUESTOR_ID}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CARDSERV_BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderMerchantId }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return {
    ok: res.ok,
    statusCode: res.status,
    orderSystemId: data?.orderSystemId ?? null,
    orderState: data?.orderState ?? "PROCESSING",
    redirectUrl: data?.outputRedirectToUrl ?? null,
    raw: data,
  };
}


// /lib/cardserv.ts
export async function createCardServOrder(payload: any) {
  const {
    CARDSERV_BASE_URL, CARDSERV_REQUESTOR_ID, CARDSERV_BEARER_TOKEN,
    CARDSERV_CURRENCY, NEXT_PUBLIC_APP_URL,
  } = process.env;

  const orderMerchantId = randomUUID();
  const saleUrl   = `${CARDSERV_BASE_URL}/api/payments/sale/${CARDSERV_REQUESTOR_ID}`;
  const statusUrl = `${CARDSERV_BASE_URL}/api/payments/status/${CARDSERV_REQUESTOR_ID}`;
  const headers = { Authorization: `Bearer ${CARDSERV_BEARER_TOKEN}`, "Content-Type": "application/json" };

  const body = {
    order: {
      orderMerchantId,
      orderDescription: payload.description || "Token top-up",
      orderAmount: (payload.amount ?? 1).toFixed(2),
      orderCurrencyCode: CARDSERV_CURRENCY || "EUR",
    },
    // 👇 ДОДАЙ 3DS2 browser-характеристики (є в офіційній колекції)
    browser: {
      ipAddress: payload.browser?.ip || "2.58.95.68",
      acceptHeader: payload.browser?.acceptHeader || "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      colorDepth: 32,
      javascriptEnabled: "true",
      acceptLanguage: "en-US",
      screenHeight: 1080,
      screenWidth: 1920,
      timeZone: -120,
      userAgent: payload.browser?.userAgent || "Mozilla/5.0",
      javaEnabled: "false",
    },
    customer: {
      firstname: payload.card?.name?.split(" ")[0] || "John",
      lastname:  payload.card?.name?.split(" ")[1] || "Doe",
      customerEmail: payload.email || "test@example.com",
    },
    card: {
      cardNumber:    payload.card?.cardNumber || "4444444411111111", // 3DS1 PaReq card (емулятор)
      cvv2:          payload.card?.cvv || "123",
      expireMonth:   payload.card?.expiry?.split("/")[0] || "12",
      expireYear:   `20${payload.card?.expiry?.split("/")[1] || "26"}`,
      cardPrintedName: payload.card?.name || "John Doe",
    },
    urls: {
      // Результат (PaRes/CRes прилетить на цю адресу методом POST з ACS)
      resultUrl:  `${NEXT_PUBLIC_APP_URL}/api/cardserv/result`,
      // Обовʼязково: отримуєш фінальні стани незалежно від браузера
      webhookUrl: `${NEXT_PUBLIC_APP_URL}/api/cardserv/webhook`,
    },
  };

  const saleRes  = await fetch(saleUrl, { method: "POST", headers, body: JSON.stringify(body) });
  const saleText = await saleRes.text();
  let saleData: any; try { saleData = JSON.parse(saleText); } catch { saleData = { raw: saleText }; }

  // Полінг статусу: шукаємо або outputRedirectToUrl (фрейм редірект),
  // або threeDSAuth (acsUrl + paReq/creq). НІЧОГО не «склеюємо» в GET.
  let statusData: any = null;
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 800));
    const r = await fetch(statusUrl, { method: "POST", headers, body: JSON.stringify({ orderMerchantId }) });
    const t = await r.text();
    try { statusData = JSON.parse(t); } catch { statusData = { raw: t }; }

    // Достатньо, якщо зʼявився будь-який із сценаріїв 3DS
    if (statusData?.outputRedirectToUrl || statusData?.threeDSAuth?.acsUrl || statusData?.orderState !== "PROCESSING") break;
  }

  return {
    ok: saleRes.ok,
    orderMerchantId,
    orderSystemId: statusData?.orderSystemId ?? null,
    orderState: statusData?.orderState ?? "PROCESSING",
    // НЕ заповнюємо redirectUrl acsUrl-ом — повертай threeDSAuth для POST-форми
    redirectUrl: statusData?.outputRedirectToUrl || null,
    threeDSAuth: statusData?.threeDSAuth || null,
    raw: { sale: saleData, status: statusData },
  };
}

