export type CardServCurrency = "EUR" | "USD" | "GBP";

type CardServConfig = {
  requestorId: string;
  token: string;
  currency: CardServCurrency;
  country: "DE" | "US" | "GB";
  BASE_URL: string;
};

export function getCardServConfig(currency: CardServCurrency): CardServConfig {
  const BASE_URL = process.env.CARDSERV_BASE_URL!;
  if (!BASE_URL) throw new Error("Missing CARDSERV_BASE_URL");

  const map: Record<CardServCurrency, Omit<CardServConfig, "BASE_URL">> = {
    EUR: {
      requestorId: process.env.CARDSERV_EUR_REQUESTOR_ID!,
      token: process.env.CARDSERV_EUR_TOKEN!,
      currency: "EUR",
      country: "DE",
    },
    USD: {
      requestorId: process.env.CARDSERV_USD_REQUESTOR_ID!,
      token: process.env.CARDSERV_USD_TOKEN!,
      currency: "USD",
      country: "US",
    },
    GBP: {
      requestorId: process.env.CARDSERV_GBP_REQUESTOR_ID!,
      token: process.env.CARDSERV_GBP_TOKEN!,
      currency: "GBP",
      country: "GB",
    },
  };

  const cfg = map[currency];
  if (!cfg?.requestorId || !cfg?.token) {
    throw new Error(`Missing CardServ credentials for ${currency}`);
  }

  return {
    BASE_URL,
    ...cfg,
  };
}
