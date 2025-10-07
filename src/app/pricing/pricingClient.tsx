'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Segmented from '@/components/ui/Segmented';
import { CC, VAT_RATES } from '@/lib/constants';
import { Currency } from '@/lib/currency';
import { convertToTokens, convertTokensToCurrency, formatCurrency } from '@/lib/currency';
import { PRICING_PLANS } from '@/lib/data';
import PlanCard from '@/components/pricing/PlanCard';
import CustomPlanCard from '@/components/pricing/CustomPlanCard';

const COUNTRIES = Object.keys(CC);

const FAQ_ITEMS = [
  {
    question: 'Do prices include taxes?',
    answer: 'Prices are shown excluding VAT. UK/EU VAT (or local taxes/fees) is calculated at checkout based on your billing details.',
  },
  {
    question: 'How are tokens priced?',
    answer: '£1.00 GBP = 100 tokens (base currency). Other currencies are converted at current exchange rates. Typical actions: Create CV/Resume draft — 10 tokens, Export (PDF/DOCX) — 5 tokens each, Improve with AI — 20 tokens, Personal manager — 80 tokens.',
  },
  {
    question: 'Do tokens expire?',
    answer: 'No. Tokens never expire.',
  },
  {
    question: 'Can I cancel or get a refund?',
    answer: 'Top-ups are pay-as-you-go and non-refundable once completed.',
  },
  {
    question: 'Which payment methods do you support?',
    answer: 'All major cards (Visa, Mastercard, Amex) and popular wallets (Apple Pay / Google Pay). Bank transfer available for larger orders on request.',
  },
  {
    question: 'Which currencies can I pay in?',
    answer: 'GBP (base currency), EUR, and USD. All prices are calculated from GBP (1.00 GBP = 100 tokens) and converted at current exchange rates. Your card may convert from another currency at your issuer\'s rate.',
  },
  {
    question: 'Do you issue invoices/receipts?',
    answer: 'Yes. A receipt (and VAT invoice if applicable) is emailed after payment. Add your company details and VAT number at checkout.',
  },
  {
    question: 'Is there a minimum top-up?',
    answer: 'Minimum top-up is £5 / €5. Larger amounts are supported via the Custom option.',
  },
  {
    question: 'Is my payment data secure?',
    answer: 'Payments are processed by a PCI-DSS compliant provider. We don’t store full card details on our servers.',
  },
];

function money(n: number, currency: Currency) {
  const locale = currency === 'GBP' ? 'en-GB' : 'en-IE';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);
}

// Unified PlanCard is used for all plan cards; no secondary card implementations here.

export default function PricingClient() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>(()=>{
    if (typeof window === 'undefined') return 'GBP';
    try { return (localStorage.getItem('currency') as Currency) || 'GBP'; } catch { return 'GBP'; }
  });
  const [country, setCountry] = useState<string>('United Kingdom');
    const { status } = useSession();
  const router = useRouter();
  const signedIn = status === 'authenticated';

  const vatRate = useMemo(() => {
    const code = (CC as Record<string,string>)[country] || 'UK';
    const rates = (VAT_RATES as Record<string, number[]>)[code] || [0,20];
    return rates[rates.length-1] || 20;
  }, [country]);

  const formatPrice = (priceText: string) => {
    const match = priceText.match(/([0-9]+(?:\.[0-9]+)?)/);
    const amount = match ? match[1] : '0';
    return `${currency} ${amount}`;
  };

  useEffect(()=>{
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR')) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const handlePlanRequest = (label: string) => {
    if (!signedIn) {
      router.push('/auth/signin?mode=login');
      return;
    }

    toast.info('Token top-ups are handled manually. Please reach out via the contact form.');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Section className="py-12">
        <div className="text-center">
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold">Top-Up</h1>
          <p className="mt-2 text-slate-600">Choose a top-up, set your country & currency — we estimate VAT for transparency.</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Segmented
              options={[{label:'GBP', value:'GBP'},{label:'EUR', value:'EUR'},{label:'USD', value:'USD'}]}
              value={currency}
              onChange={(v)=>setCurrency(v as Currency)}
            />
            <select
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              value={country}
              onChange={(e)=>setCountry(e.target.value)}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                onAction={() => handlePlanRequest(plan.name)}
              />
            );
          })}
          <CustomPlanCard currency={currency} onRequest={() => handlePlanRequest('custom')} />
        </div>

        <div className='mt-12 max-w-3xl mx-auto rounded-2xl border border-black/10 bg-white p-6'>
          <h3 className='text-lg font-semibold'>FAQ</h3>
          <div className='mt-4 space-y-4 text-sm text-slate-700'>
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <div className='font-medium'>{item.question}</div>
                <p className='text-slate-600 mt-1'>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
        {!signedIn && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center">
            <h3 className="text-lg font-semibold">Ready to get started?</h3>
            <p className="mt-1 text-slate-600 text-sm">Create an account to top up tokens.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button size="lg" href="/auth/signin?mode=signup">Sign up</Button>
              <Button size="lg" variant="outline" href="/auth/signin?mode=login">Log in</Button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

// CustomPlanCard removed: use only the unified PlanCard across pages.


