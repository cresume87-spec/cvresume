'use client';

import { Suspense, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { usePreferredCurrency } from '@/lib/currencyPreference';
import { Currency, SERVICE_COSTS, formatCurrency, getPlanDisplayAmount, getTokenRateText } from '@/lib/currency';

type FAQCategory = 'creation' | 'tools' | 'tokens' | 'export' | 'account' | 'troubleshooting';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  top?: boolean;
};

const CATEGORIES: Array<{ id: FAQCategory | 'all'; label: string; color: string }> = [
  { id: 'all', label: 'All', color: 'bg-slate-900 text-white' },
  { id: 'creation', label: 'Creating your CV/Resume', color: 'bg-blue-100 text-blue-800' },
  { id: 'tools', label: 'Writing tools, AI & manager', color: 'bg-purple-100 text-purple-800' },
  { id: 'tokens', label: 'Tokens & payments', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'export', label: 'Export & sharing', color: 'bg-amber-100 text-amber-800' },
  { id: 'account', label: 'Account & privacy', color: 'bg-orange-100 text-orange-800' },
  { id: 'troubleshooting', label: 'Troubleshooting', color: 'bg-rose-100 text-rose-800' },
];

function buildFaqData(currency: Currency): FAQItem[] {
  const starter = formatCurrency(getPlanDisplayAmount(5, currency), currency);
  const pro = formatCurrency(getPlanDisplayAmount(15, currency), currency);
  const business = formatCurrency(getPlanDisplayAmount(30, currency), currency);

  return [
    {
      id: 'top-what-can-i-do',
      question: 'What can I do here?',
      answer:
        'Create a CV or resume from scratch, improve your draft with built-in writing tools, or request help from a personal manager who will edit your document.',
      category: 'creation',
      top: true,
    },
    {
      id: 'top-pricing-model',
      question: 'How does pricing work?',
      answer: `Pay as you go with tokens. ${getTokenRateText(currency)}. Actions: Create - ${SERVICE_COSTS.CREATE_DRAFT}, Create & Export PDF - ${
        SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF
      }, Improve with AI - ${SERVICE_COSTS.AI_IMPROVE}, Send to personal manager - ${SERVICE_COSTS.PERSONAL_MANAGER}.`,
      category: 'tokens',
      top: true,
    },
    {
      id: 'top-drafting-cost',
      question: 'Is drafting free?',
      answer: `No. Creating a draft costs ${SERVICE_COSTS.CREATE_DRAFT} tokens and adds the document to your Dashboard.`,
      category: 'creation',
      top: true,
    },
    {
      id: 'create-ats-friendly',
      question: 'Will my document be ATS-friendly?',
      answer: 'Yes. Our templates follow common ATS reading patterns with clear headings, clean layout, and no heavy graphics.',
      category: 'creation',
    },
    {
      id: 'create-templates',
      question: 'Do you have different styles/templates?',
      answer: 'Yes. Choose from several professional templates (classic, split, serif, compact) and switch styles any time before export.',
      category: 'creation',
    },
    {
      id: 'tools-improve-ai',
      question: 'What does Improve with AI do?',
      answer: `It rewrites selected sections like summary, bullets, and skills to be concise and professional. Cost: ${SERVICE_COSTS.AI_IMPROVE} tokens per run.`,
      category: 'tools',
    },
    {
      id: 'tools-personal-manager',
      question: 'Who is the personal manager and what will I get?',
      answer: `A specialist reviews your content and sends personalised edits and comments. Cost: ${SERVICE_COSTS.PERSONAL_MANAGER} tokens. First response is typically within 3-6 hours.`,
      category: 'tools',
    },
    {
      id: 'tokens-expire',
      question: 'Do tokens expire?',
      answer: 'No. Tokens never expire.',
      category: 'tokens',
    },
    {
      id: 'tokens-packages',
      question: 'Which top-up packages are available?',
      answer: `Examples: Starter ${starter} = 500 tokens, Pro ${pro} = 1,500 tokens, Business ${business} = 3,000 tokens, plus Custom.`,
      category: 'tokens',
    },
    {
      id: 'tokens-payment-methods',
      question: 'Which payment methods do you support?',
      answer: 'We accept major cards. Additional payment methods depend on the payment provider flow available at checkout.',
      category: 'tokens',
    },
    {
      id: 'tokens-taxes',
      question: 'Are taxes included?',
      answer: 'Yes. Displayed prices already include VAT.',
      category: 'tokens',
    },
    {
      id: 'tokens-refunds',
      question: 'Refunds',
      answer: 'Top-ups are pay-as-you-go and non-refundable once completed, except where required by law or our refund policy.',
      category: 'tokens',
    },
    {
      id: 'export-formats',
      question: 'What formats can I export to?',
      answer: `PDF and DOCX. Create & Export PDF costs ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens in total and generates a final PDF immediately.`,
      category: 'export',
    },
    {
      id: 'export-preview',
      question: 'Will the export match the preview?',
      answer: 'Yes. The A4 live preview uses print-safe spacing and fonts so the exported PDF matches the preview.',
      category: 'export',
    },
    {
      id: 'account-data-storage',
      question: 'Where is my data stored?',
      answer: 'We store the data needed to provide the service and follow GDPR principles. Payment card details are handled by the payment provider, not stored in full on our servers.',
      category: 'account',
    },
    {
      id: 'account-delete',
      question: 'How do I delete my account or data?',
      answer: 'Contact support if you want to request account deletion. We remove personal data except what must be retained for legal or accounting obligations.',
      category: 'account',
    },
    {
      id: 'troubleshooting-pdf',
      question: 'My PDF looks different than expected.',
      answer: 'Set your PDF viewer to 100 percent zoom and try another browser if needed. If the issue persists, contact support.',
      category: 'troubleshooting',
    },
    {
      id: 'troubleshooting-ai',
      question: 'The AI suggestions do not match my role.',
      answer: 'Add more context such as industry, seniority, or keywords, then run Improve with AI again. You can also request a personal manager review for tailored edits.',
      category: 'troubleshooting',
    },
    {
      id: 'troubleshooting-out-of-tokens',
      question: "I'm out of tokens. What now?",
      answer: 'Top up from the Top-Up page. The calculator will show how many tokens you need for your selected actions.',
      category: 'troubleshooting',
    },
  ];
}

function FAQPageContent() {
  const [currency] = usePreferredCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqData = useMemo(() => buildFaqData(currency), [currency]);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return faqData.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
    });
  }, [faqData, searchQuery, selectedCategory]);

  const topQuestions = filteredFaqs.filter((item) => item.top);
  const groupedFaqs = useMemo(() => {
    const groups: Record<FAQCategory, FAQItem[]> = {
      creation: [],
      tools: [],
      tokens: [],
      export: [],
      account: [],
      troubleshooting: [],
    };

    filteredFaqs
      .filter((item) => !item.top)
      .forEach((item) => {
        groups[item.category].push(item);
      });

    return groups;
  }, [filteredFaqs]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyLink = async (id: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/help/faq#${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Frequently asked questions</h1>
          <p className="mb-8 text-lg text-slate-600">Pay-as-you-go tokens. Displayed prices already include VAT.</p>

          <div className="mx-auto mb-6 max-w-2xl">
            <Input
              placeholder="Search FAQs (for example: tokens, refund, VAT)"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full py-3 text-lg"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? category.id === 'all'
                        ? category.color
                        : 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {topQuestions.length > 0 ? (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Top questions</h2>
            <div className="grid gap-4">
              {topQuestions.map((item) => (
                <FAQCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedItems.has(item.id)}
                  onToggle={() => toggleExpanded(item.id)}
                  onCopyLink={() => copyLink(item.id)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {(Object.keys(groupedFaqs) as FAQCategory[]).map((categoryKey) => {
          const items = groupedFaqs[categoryKey];
          if (items.length === 0) return null;

          const category = CATEGORIES.find((entry) => entry.id === categoryKey);
          if (!category) return null;

          return (
            <div key={categoryKey} className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${category.color}`}>
                  {category.label}
                </span>
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <FAQCard
                    key={item.id}
                    item={item}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => toggleExpanded(item.id)}
                    onCopyLink={() => copyLink(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredFaqs.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-xl font-semibold text-slate-900">No results found</h3>
            <p className="mb-6 text-slate-600">Try different keywords or browse by category.</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : null}

        <div className="mt-16 text-center">
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <h3 className="mb-4 text-xl font-semibold text-slate-900">Still need help?</h3>
            <p className="mb-6 text-slate-600">If you cannot find what you need here, our support team can help.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button href="/create-cv" size="lg">
                Create my CV
              </Button>
              <Button href="/pricing" size="lg" variant="outline">
                Top up tokens
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function FAQPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-slate-900">Frequently asked questions</h1>
              <p className="text-lg text-slate-600">Loading...</p>
            </div>
          </section>
        </main>
      }
    >
      <FAQPageContent />
    </Suspense>
  );
}

function FAQCard({
  item,
  isExpanded,
  onToggle,
  onCopyLink,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyLink: () => void;
}) {
  return (
    <Card className="overflow-hidden" id={item.id}>
      <div className="flex items-start justify-between gap-4 p-6 transition-colors hover:bg-slate-50">
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 text-left"
          aria-expanded={isExpanded}
        >
          <h3 className="pr-4 text-lg font-semibold text-slate-900">{item.question}</h3>
        </button>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCopyLink}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            title="Copy link"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            aria-label={isExpanded ? 'Collapse answer' : 'Expand answer'}
            aria-expanded={isExpanded}
          >
            <svg
              className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200 px-6 pb-6 pt-4 text-slate-700">{item.answer}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
