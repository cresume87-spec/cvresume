"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';

const TOKENS_PER_UNIT = 100;
const MIN_TOP_UP = 0.01;

type Currency = 'GBP' | 'EUR';
type ActionKey = 'draft' | 'pdf' | 'docx' | 'ai' | 'manager';

type ActionConfig = {
  id: ActionKey;
  label: string;
  description: string;
  tokens: number;
};

const ACTIONS: ActionConfig[] = [
  {
    id: 'draft',
    label: 'Create draft',
    description: 'Creates a draft CV/resume in your Dashboard.',
    tokens: 100,
  },
  {
    id: 'pdf',
    label: 'Create & Export PDF',
    description: 'Instantly generates a ready-to-download PDF.',
    tokens: 150,
  },
  {
    id: 'docx',
    label: 'Create & Export DOCX',
    description: 'Exports a DOCX version for further editing.',
    tokens: 150,
  },
  {
    id: 'ai',
    label: 'Improve with AI',
    description: 'Refines wording, structure, and impact using AI.',
    tokens: 200,
  },
  {
    id: 'manager',
    label: 'Send to personal manager',
    description: 'Specialist review with feedback in 3–6 hours.',
    tokens: 800,
  },
];

const FAQ_ITEMS = [
  {
    question: 'How does the calculator work?',
    answer: 'Pick the actions you need — the calculator totals the tokens and shows the GBP/EUR equivalent at £1.00 / €1.00 = 100 tokens.',
  },
  {
    question: 'Which actions can I estimate?',
    answer: 'Create — 100 tokens. Create & Export PDF — 150 tokens. Create & Export DOCX — 150 tokens. Improve with AI — 200 tokens. Send to personal manager — 800 tokens.',
  },
  {
    question: 'How accurate is the estimate?',
    answer: 'It reflects current rates at the time of calculation. VAT/taxes are not included and will be added at checkout where applicable.',
  },
];

const EXAMPLES: Array<{
  title: string;
  description: string;
  actions: Partial<Record<ActionKey, number>>;
}> = [
  {
    title: 'One polished CV',
    description: 'Create + AI polish + PDF export.',
    actions: { draft: 1, ai: 1, pdf: 1 },
  },
  {
    title: 'Job hunt weekend',
    description: 'Two tailored resumes with AI and PDF exports.',
    actions: { draft: 2, ai: 2, pdf: 2 },
  },
  {
    title: 'Manager-assisted revamp',
    description: 'Create, AI improve, and send to personal manager.',
    actions: { draft: 1, ai: 1, manager: 1 },
  },
  {
    title: 'Full team refresh',
    description: 'Five drafts and four exports for a small team.',
    actions: { draft: 5, pdf: 4 },
  },
];

function formatCurrency(amount: number, currency: Currency) {
  const locale = currency === 'GBP' ? 'en-GB' : 'de-DE';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function currencySymbol(currency: Currency) {
  return currency === 'GBP' ? '£' : '€';
}

export default function TokenCalculatorPage() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [counts, setCounts] = useState<Record<ActionKey, number>>(() =>
    ACTIONS.reduce((acc, action) => {
      acc[action.id] = 0;
      return acc;
    }, {} as Record<ActionKey, number>),
  );

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (event: MessageEvent) => {
        const data: any = (event as MessageEvent).data;
        if (data?.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR')) {
          setCurrency(data.currency);
        }
      };
    } catch {
      bcRef.current = null;
    }
    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  const totalTokens = useMemo(() => {
    return ACTIONS.reduce((sum, action) => sum + counts[action.id] * action.tokens, 0);
  }, [counts]);

  const estimatedCost = totalTokens / TOKENS_PER_UNIT;
  const recommendedTopUp = Math.max(MIN_TOP_UP, Math.ceil(estimatedCost * 100) / 100);
  const tokensPerUnitLabel = currency === 'GBP' ? '£1.00' : '€1.00';

  const handleCountChange = (action: ActionKey, value: string) => {
    const parsed = Math.max(0, Math.floor(Number(value) || 0));
    setCounts((prev) => ({ ...prev, [action]: parsed }));
  };

  const applyExample = (exampleActions: Partial<Record<ActionKey, number>>) => {
    setCounts((prev) => {
      const next = { ...prev };
      ACTIONS.forEach((action) => {
        next[action.id] = exampleActions[action.id] ?? 0;
      });
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Token calculator</h1>
          <p className="mt-2 text-slate-600">Calculate tokens needed and see effective cost per document.</p>
          <div className="mt-6 flex justify-center">
            <Segmented
              options={[
                { label: 'GBP', value: 'GBP' },
                { label: 'EUR', value: 'EUR' },
              ]}
              value={currency}
              onChange={(value) => setCurrency(value as Currency)}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">Calculate tokens</h2>
            <p className="mt-1 text-sm text-slate-600">Adjust the number of actions you plan to run. Each action multiplies by its token cost.</p>
            <div className="mt-6 space-y-4">
              {ACTIONS.map((action) => (
                <div key={action.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{action.label}</div>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div className="font-semibold text-slate-900">{action.tokens} tokens</div>
                      <div>{currencySymbol(currency)}{(action.tokens / TOKENS_PER_UNIT).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-sm text-slate-600">Quantity</label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={counts[action.id].toString()}
                      onChange={(event) => handleCountChange(action.id, event.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Results</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Total tokens</span>
                <span className="text-base font-semibold text-slate-900">{totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated cost</span>
                <span className="text-base font-semibold text-slate-900">
                  {formatCurrency(estimatedCost, currency)} <span className="text-xs text-slate-500">(at {tokensPerUnitLabel} = 100 tokens)</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Suggested top-up</span>
                <span className="text-base font-semibold text-emerald-600">{formatCurrency(recommendedTopUp, currency)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button href="/pricing" size='lg' onClick={() => {
                if (typeof window !== 'undefined') {
                  // @ts-ignore
                  window.gtag?.('event', 'calc_go_to_pricing', {
                    currency,
                    total_tokens: totalTokens,
                    estimated_cost: estimatedCost,
                  });
                }
              }}>
                Go to top-up page
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setCounts(ACTIONS.reduce((acc, action) => {
                    acc[action.id] = 0;
                    return acc;
                  }, {} as Record<ActionKey, number>));
                }}
              >
                Clear calculator
              </Button>
            </div>
          </Card>
        </div>

        <section className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">Examples</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {EXAMPLES.map((example) => {
              const exampleTokens = ACTIONS.reduce((sum, action) => sum + (example.actions[action.id] ?? 0) * action.tokens, 0);
              const exampleCost = exampleTokens / TOKENS_PER_UNIT;
              return (
                <motion.div
                  key={example.title}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400 transition"
                  whileHover={{ y: -4 }}
                  onClick={() => applyExample(example.actions)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{example.title}</div>
                      <p className="text-sm text-slate-600">{example.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <div className="font-semibold text-slate-900">{exampleTokens.toLocaleString()} tokens</div>
                      <div>{formatCurrency(exampleCost, currency)}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="p-5">
                  <h4 className="font-semibold text-slate-900 mb-2">{item.question}</h4>
                  <p className="text-sm text-slate-600">{item.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
