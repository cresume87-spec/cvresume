// Currency conversion system with GBP as the base currency.
// 1.00 GBP = 100 tokens.

export const SUPPORTED_CURRENCIES = ['GBP', 'EUR', 'USD', 'AUD', 'CAD', 'NZD'] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = 'GBP';

export function isSupportedCurrency(value: string | null | undefined): value is Currency {
  return !!value && SUPPORTED_CURRENCIES.includes(value as Currency);
}

// Exchange rates relative to GBP (base currency).
export const EXCHANGE_RATES: Record<Currency, number> = {
  GBP: 1.0,
  EUR: 1.15,
  USD: 1.27,
  AUD: 1.91,
  CAD: 1.85,
  NZD: 2.27,
};

export const TOKENS_PER_GBP = 100;

export interface CurrencyConversion {
  amount: number;
  currency: Currency;
  tokens: number;
  gbpEquivalent: number;
}

export function convertToTokens(amount: number, currency: Currency): CurrencyConversion {
  const gbpAmount = amount / EXCHANGE_RATES[currency];
  const tokens = Math.floor(gbpAmount * TOKENS_PER_GBP);

  return {
    amount,
    currency,
    tokens,
    gbpEquivalent: gbpAmount,
  };
}

export function convertTokensToCurrency(tokens: number, currency: Currency): number {
  const gbpAmount = tokens / TOKENS_PER_GBP;
  return gbpAmount * EXCHANGE_RATES[currency];
}

export function formatCurrency(amount: number, currency: Currency): string {
  const locale =
    currency === 'GBP'
      ? 'en-GB'
      : currency === 'EUR'
      ? 'en-IE'
      : currency === 'USD'
      ? 'en-US'
      : currency === 'AUD'
      ? 'en-AU'
      : currency === 'CAD'
      ? 'en-CA'
      : 'en-NZ';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getTokenRateText(currency: Currency): string {
  const amount = convertTokensToCurrency(TOKENS_PER_GBP, currency);
  return `${formatCurrency(amount, currency)} = ${TOKENS_PER_GBP} tokens`;
}

export function getPlanDisplayAmount(baseGbpAmount: number, currency: Currency): number {
  const tokens = convertToTokens(baseGbpAmount, 'GBP').tokens;
  return convertTokensToCurrency(tokens, currency);
}

export const PRICING_PLANS = [
  {
    id: 'plan-starter',
    name: 'Starter',
    gbpAmount: 5.0,
    tokens: convertToTokens(5.0, 'GBP').tokens,
    popular: false,
    cta: 'Request top-up',
    bullets: [
      'Top up 500 tokens (~50 documents)',
      'No subscription',
      'Prices include VAT',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    gbpAmount: 15.0,
    tokens: convertToTokens(15.0, 'GBP').tokens,
    popular: true,
    cta: 'Request top-up',
    bullets: [
      'Top up 1,500 tokens (~150 documents)',
      'Branding options',
      'Prices include VAT',
    ],
  },
  {
    id: 'plan-business',
    name: 'Business',
    gbpAmount: 30.0,
    tokens: convertToTokens(30.0, 'GBP').tokens,
    popular: false,
    cta: 'Request top-up',
    bullets: [
      'Top up 3,000 tokens (~300 documents)',
      'Priority support',
      'Prices include VAT',
    ],
  },
] as const;

export type Plan = (typeof PRICING_PLANS)[number];

export const SERVICE_COSTS = {
  CREATE_DRAFT: 100,
  EXPORT_PDF: 50,
  EXPORT_DOCX: 50,
  AI_IMPROVE: 200,
  PERSONAL_MANAGER: 800,
} as const;

export function calculateServiceCost(services: (keyof typeof SERVICE_COSTS)[]): number {
  return services.reduce((total, service) => total + SERVICE_COSTS[service], 0);
}
