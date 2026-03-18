'use client';

import { useEffect, useState } from 'react';
import { Currency, DEFAULT_CURRENCY, isSupportedCurrency } from '@/lib/currency';

const CURRENCY_STORAGE_KEY = 'currency';
const APP_EVENTS_CHANNEL = 'app-events';

export function readStoredCurrency(fallback: Currency = DEFAULT_CURRENCY): Currency {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    return isSupportedCurrency(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function persistCurrency(currency: Currency) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  } catch {
    return;
  }

  try {
    const channel = new BroadcastChannel(APP_EVENTS_CHANNEL);
    channel.postMessage({ type: 'currency-updated', currency });
    channel.close();
  } catch {
    // Ignore channel failures and keep local storage as the source of truth.
  }
}

export function usePreferredCurrency(initialCurrency: Currency = DEFAULT_CURRENCY) {
  const [currency, setCurrencyState] = useState<Currency>(() => readStoredCurrency(initialCurrency));

  useEffect(() => {
    setCurrencyState(readStoredCurrency(initialCurrency));

    let channel: BroadcastChannel | null = null;

    try {
      channel = new BroadcastChannel(APP_EVENTS_CHANNEL);
      channel.onmessage = (event: MessageEvent) => {
        const nextCurrency = (event.data as { currency?: string } | null)?.currency;
        if (isSupportedCurrency(nextCurrency)) {
          setCurrencyState(nextCurrency);
        }
      };
    } catch {
      channel = null;
    }

    return () => {
      try {
        channel?.close();
      } catch {
        // Ignore close failures.
      }
    };
  }, [initialCurrency]);

  const setCurrency = (nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    persistCurrency(nextCurrency);
  };

  return [currency, setCurrency] as const;
}
