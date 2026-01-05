'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const TOKENS_PER_CURRENCY_UNIT = 100;
const TOKENS_PER_DOCUMENT = 150;
const COST_PER_DOCUMENT = (TOKENS_PER_DOCUMENT / TOKENS_PER_CURRENCY_UNIT).toFixed(2);

const TOKEN_PACKAGES = [
  { amount: 10, currency: 'GBP', tokens: 1000 },
  { amount: 50, currency: 'GBP', tokens: 5000 },
  { amount: 100, currency: 'GBP', tokens: 10000 },
  { amount: 10, currency: 'EUR', tokens: 1000 },
  { amount: 50, currency: 'EUR', tokens: 5000 },
  { amount: 100, currency: 'EUR', tokens: 10000 },
];

const LEDGER_SAMPLE = [
  { date: '2024-01-15', type: 'Top-up', delta: 1000, balance: 1000 },
  { date: '2024-01-15', type: 'CV', delta: -150, balance: 850 },
  { date: '2024-01-16', type: 'Resume', delta: -150, balance: 700 },
  { date: '2024-01-17', type: 'AI Assist', delta: -200, balance: 500 },
  { date: '2024-01-18', type: 'Top-up', delta: 5000, balance: 5500 },
  { date: '2024-01-19', type: 'Manager Assist', delta: -800, balance: 4700 },
  { date: '2024-01-20', type: 'Draft', delta: -100, balance: 4600 },
];

export default function BillingTokensPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<'GBP' | 'EUR' | 'USD'>('GBP');
  const [customAmount, setCustomAmount] = useState<number>(10);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'billing_view', {
        page_title: 'Billing & Tokens',
      });
    }
  }, []);

  const handleTopUpClick = (amount?: number) => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'billing_click_topup', {
        amount: amount || customAmount,
        currency: selectedCurrency,
      });
    }
  };

const calculateTokens = (amount: number) => Math.max(0, Math.round(amount * TOKENS_PER_CURRENCY_UNIT));
const calculateDocuments = (tokens: number) => tokens / TOKENS_PER_DOCUMENT;
const calculateCostPerDocument = () => COST_PER_DOCUMENT;

  const filteredPackages = TOKEN_PACKAGES.filter(pkg => pkg.currency === selectedCurrency);

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Billing & Tokens</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Understand our pay-as-you-go model, token pricing, and billing system.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">How it works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Pay-as-you-go</h3>
                    <p className="text-sm text-slate-600">No subscriptions or monthly fees</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🪙</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">1 {selectedCurrency} = 100 tokens</h3>
                    <p className="text-sm text-slate-600">Simple conversion rate</p>
                  </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📄</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">1 document = 150 tokens</h3>
                      <p className="text-sm text-slate-600">Fixed cost per document</p>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">Note - your tokens never expire</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Token Calculator</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Amount ({selectedCurrency})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="5"
                        step="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value as 'GBP' | 'EUR' | 'USD')}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Tokens</span>
                      <span className="font-semibold text-slate-900">{calculateTokens(customAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">CV's or resumes</span>
                      <span className="font-semibold text-slate-900">≈{calculateDocuments(calculateTokens(customAmount)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-emerald-700">Cost per document</span>
                      <span className="font-semibold text-emerald-900">{selectedCurrency} {calculateCostPerDocument()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">How to top up</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredPackages.map((pkg, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 mb-1">
                          {pkg.currency} {pkg.amount}
                        </div>
                        <div className="text-sm text-slate-600">
                          {pkg.tokens.toLocaleString()} tokens
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 font-semibold text-sm">💡 Custom amounts</div>
                    <p className="text-[#1E40AF] text-sm">
                      You can top up any amount from {selectedCurrency}5 to {selectedCurrency}10,000.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Receipts & Records</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Downloadable receipts</h3>
                    <p className="text-slate-700 text-sm mb-3">
                      Each top-up generates a receipt you can download from your dashboard for bookkeeping.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Ledger history</h3>
                    <p className="text-slate-700 text-sm mb-3">
                      Track every token movement — top-ups, AI usage, drafts and exports — in a searchable ledger.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Export options</h3>
                    <p className="text-slate-700 text-sm mb-3">
                      Need an audit trail? Export ledger data as CSV or request a detailed statement from support.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Token Ledger Sample</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-slate-700">Date</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-700">Type</th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-700">Delta</th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LEDGER_SAMPLE.map((entry, index) => (
                        <tr key={index} className="border-t border-slate-200">
                          <td className="px-3 py-2 text-slate-600">{entry.date}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.type === 'Top-up' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className={`px-3 py-2 text-right font-medium ${
                            entry.delta > 0 ? 'text-emerald-600' : entry.delta < 0 ? 'text-rose-600' : 'text-slate-900'
                          }`}>
                            {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">{entry.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Refunds</h2>
                <p className="text-slate-700 mb-4">
                  Unused tokens can be refunded within 14 days of purchase. Used tokens (for issued invoices) 
                  are non-refundable. All refunds are processed to the original payment method within 5-10 business days.
                </p>
                <Button href="/refund" variant="outline" size="sm">
                  View Refund Policy
                </Button>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Methods & Limits</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Accepted Methods</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li>• Credit/Debit cards (Visa, Mastercard, Amex)</li>
                      <li>• Apple Pay</li>
                      <li>• Google Pay</li>
                      <li>• Bank transfer (for large amounts)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Limits</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li>• Minimum: {selectedCurrency}5 per transaction</li>
                      <li>• Maximum: {selectedCurrency}10,000 per transaction</li>
                      <li>• Daily limit: {selectedCurrency}25,000</li>
                      <li>• Fraud protection: Automatic monitoring</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 font-semibold text-sm">⚠️ Payment Issues</div>
                    <p className="text-amber-800 text-sm">
                      If your payment is declined, check your card details and billing address. 
                      For large amounts, contact support for bank transfer options.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      href={`/pricing?amount=${customAmount}&currency=${selectedCurrency}`}
                      className="w-full"
                      onClick={() => handleTopUpClick()}
                    >
                      Top up tokens
                    </Button>
                    <Button 
                      href="/token-calculator" 
                      variant="outline" 
                      className="w-full"
                    >
                      Open Token Calculator
                    </Button>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Need Help?</h3>
                  <div className="space-y-3 text-sm">
                    <Link href="/help/faq" className="block text-slate-600 hover:text-slate-900">
                      View FAQ
                    </Link>
                    <Link href="/contact" className="block text-slate-600 hover:text-slate-900">
                      Contact Support
                    </Link>
                    <Link href="/help/troubleshooting" className="block text-slate-600 hover:text-slate-900">
                      Troubleshooting
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


