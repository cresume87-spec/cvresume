'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import Section from '@/components/layout/Section';
import Pill from '@/components/policy/Pill';
import Button from '@/components/ui/Button';
import Segmented from '@/components/ui/Segmented';
import { CC, VAT_RATES } from '@/lib/constants';
import { Currency } from '@/lib/plans';
import { PRICING_PLANS } from '@/lib/data';
import PlanCard from '@/components/pricing/PlanCard';
import CustomPlanCard from '@/components/pricing/CustomPlanCard';

const COUNTRIES = Object.keys(CC);

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
  const [isLoading, setIsLoading] = useState<string | null>(null);
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

  const handlePurchase = async (planId: string | null, customAmount?: number) => {
    if (!signedIn) {
      return router.push('/auth/signin?mode=login');
    }

    setIsLoading(planId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ИЗМЕНЕНО: Отправляем на сервер и ID плана, и ВАЛЮТУ
        body: JSON.stringify({ planId, currency, customAmount }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Something went wrong.');
      }

      window.location.href = data.url;

    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast.error('Could not create payment session. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Section className="py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2"><Pill>UK-first</Pill><Pill>EU-ready</Pill><Pill>Prices exclude VAT</Pill></div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold">Top-Up</h1>
          <p className="mt-2 text-slate-600">Choose a top-up, set your country & currency — we estimate VAT for transparency.</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Segmented
              options={[{label:'GBP', value:'GBP'},{label:'EUR', value:'EUR'}]}
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
          {PRICING_PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              popular={plan.popular}
              bullets={plan.points}
              cta={plan.cta}
              priceText={formatPrice(plan.price)}
            />
          ))}
          <CustomPlanCard currency={currency} onPurchase={(amount, curr) => { /* MOCK: no-op */ }} />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h3 className="text-lg font-semibold">FAQ</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div>
                <div className="font-medium">MOCK: Do prices include taxes?</div>
                <p className="text-slate-600 mt-1">MOCK: Taxes/fees may apply at checkout based on your country and status. Replace with your final policy.</p>
              </div>
              <div>
                <div className="font-medium">MOCK: Can I cancel anytime?</div>
                <p className="text-slate-600 mt-1">MOCK: Describe your cancellation/changes policy in one sentence.</p>
              </div>
              <div>
                <div className="font-medium">MOCK: Which payment methods are supported?</div>
                <p className="text-slate-600 mt-1">MOCK: Cards and popular wallets. Optional bank transfer on higher tiers.</p>
              </div>
              <div>
                <div className="font-medium">MOCK: Do you issue invoices/receipts?</div>
                <p className="text-slate-600 mt-1">MOCK: Yes — add your company details and tax info as required.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <h3 className="text-lg font-semibold">Still not sure?</h3>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-dashed border-black/15 p-4">
                <div className="font-medium">MOCK: Feature A</div>
                <p className="text-slate-600 mt-1">MOCK: Short neutral description.</p>
              </div>
              <div className="rounded-xl border border-dashed border-black/15 p-4">
                <div className="font-medium">MOCK: Feature B</div>
                <p className="text-slate-600 mt-1">MOCK: Short neutral description.</p>
              </div>
              <div className="rounded-xl border border-dashed border-black/15 p-4">
                <div className="font-medium">MOCK: Feature C</div>
                <p className="text-slate-600 mt-1">MOCK: Short neutral description.</p>
              </div>
              <div className="rounded-xl border border-dashed border-black/15 p-4">
                <div className="font-medium">MOCK: Feature D</div>
                <p className="text-slate-600 mt-1">MOCK: Short neutral description.</p>
              </div>
            </div>
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
