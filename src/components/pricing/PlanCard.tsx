'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { motion, useReducedMotion } from 'framer-motion';
import { THEME } from '@/lib/theme';

type Currency = 'GBP' | 'EUR';

export type PlanCardProps = {
  name: string;
  popular?: boolean;
  badgeText?: string;
  bullets: string[];
  cta: string;
  onAction?: () => void;
  // Price variants (provide either priceText or amount+currency)
  priceText?: string; // e.g., 'GBP 10'
  amount?: number; // numeric amount (one-time)
  currency?: Currency;
  vatRatePercent?: number; // if provided, shows est. VAT line
  // Tokens info (optional). If not provided, computed from price
  tokens?: number;
};

export default function PlanCard({ name, popular, badgeText, bullets, cta, onAction, priceText, amount, currency, vatRatePercent, tokens }: PlanCardProps) {
  const resolvedAmount = (() => {
    if (typeof amount === 'number' && currency) return { amount, currency } as const;
    if (priceText) {
      const match = priceText.match(/([A-Z]{3})\s*([0-9]+(?:\.[0-9]+)?)/);
      const curr = (match?.[1] as Currency) || 'GBP';
      const amt = parseFloat(match?.[2] || '0');
      return { amount: amt, currency: curr } as const;
    }
    return { amount: 0, currency: 'GBP' as Currency } as const;
  })();

  const computedTokens = (() => {
    if (typeof tokens === 'number') return Math.max(0, Math.round(tokens));
    const TOKENS_PER_UNIT = 1; // 10 GBP/EUR => 10 tokens
    return Math.max(0, Math.round(resolvedAmount.amount * TOKENS_PER_UNIT));
  })();

  const reduceMotion = useReducedMotion();
  const incVat = typeof vatRatePercent === 'number' ? resolvedAmount.amount * (1 + vatRatePercent / 100) : null;

  const money = (n: number, curr: Currency) => new Intl.NumberFormat(curr === 'GBP' ? 'en-GB' : 'en-IE', { style: 'currency', currency: curr, maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <Card className={`${popular ? 'shadow-md border-[#E2E8F0]' : ''} flex flex-col justify-between h-full p-6`}>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{name}</h3>
            {(popular || badgeText) && (
              <motion.span
                className={`text-xs rounded-full px-2 py-1 ${THEME.primary.text} bg-black/5`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 17 }}
              >
                {badgeText || 'POPULAR'}
              </motion.span>
            )}
          </div>
          <div className="mt-3 text-3xl font-bold">
            {money(resolvedAmount.amount, resolvedAmount.currency)}
            <span className="text-base font-normal text-slate-500">/one-time</span>
          </div>
          {incVat !== null && (
            <div className="text-[11px] text-slate-500 mt-1">Est. incl. VAT: {money(incVat, resolvedAmount.currency)}</div>
          )}
          <div className="mt-1 text-xs text-slate-600">= {computedTokens} tokens</div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {bullets.map((point) => (
              <li key={point} className="flex items-start gap-2"><span>-</span><span>{point}</span></li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <Button className="w-full" size="lg" onClick={onAction}>{cta}</Button>
        </div>
      </Card>
    </motion.div>
  );
}

