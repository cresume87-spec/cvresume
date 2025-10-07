'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { PRICING_PLANS } from '@/lib/data';
import { THEME } from '@/lib/theme';
import PlanCard from '@/components/pricing/PlanCard';
import { convertToTokens, convertTokensToCurrency, formatCurrency, Currency } from '@/lib/currency';

export default function Pricing() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>('GBP');

  useEffect(()=>{
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'USD')) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    // Read saved currency on mount (client) to avoid SSR mismatch
    try {
      const saved = localStorage.getItem('currency');
      if (saved === 'GBP' || saved === 'EUR' || saved === 'USD') setCurrency(saved);
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const parseAmount = (priceText: string) => {
    const match = priceText.match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const handleTopUpRequest = () => {
    toast.info('Token top-ups are handled manually. Please contact support.');
  };

  return (
    <Section id="pricing" className="py-14">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Token top-up plans</h2>
        <p className="mt-2 text-slate-600">Tokens are charged per action. No subscription or hidden fees.</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          // Parse GBP amount from the formatted price string
          const gbpAmount = parseFloat(plan.price.replace(/[£,]/g, ''));
          const tokens = convertToTokens(gbpAmount, 'GBP').tokens;
          const convertedAmount = convertTokensToCurrency(tokens, currency);
          
          return (
            <PlanCard
              key={plan.name}
              name={plan.name}
              popular={plan.popular}
              bullets={plan.points}
              cta={plan.cta}
              amount={convertedAmount}
              currency={currency}
              tokens={tokens}
              onAction={handleTopUpRequest}
            />
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <CustomPlanCard currency={currency} onRequest={handleTopUpRequest} />
        </motion.div>
      </div>
      <div className="mx-auto max-w-3xl mt-6">
        <Card className="border-dashed">
          <div className="font-semibold">How much does an action cost?</div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            {([
              ['Create CV', '2'],
              ['Create resume', '2'],
              ['Export PDF', '1'],
              ['Export DOCX', '1'],
              ['Manager', '30'],
            ] as const).map(([label, v]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-semibold">{v} tok.</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">Tokens never expire. Refunds for exports are not provided.</div>
        </Card>
      </div>
      <p className="mt-4 text-xs text-slate-500 text-center">Taxes may apply. Tokens deposit after purchase (signed-in users only).</p>
    </Section>
  );
}
