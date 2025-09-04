'use client';

import React, { useEffect, useState } from 'react';
import Section from '@/components/layout/Section';
import { Card, Button, Input } from '@/components';

type Currency = 'GBP' | 'EUR';
type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
type Invoice = { id: string; number: string; date: string; client: string; currency: Currency; subtotal: number; tax: number; total: number; status: InvoiceStatus };
type LedgerRow = { id: string; ts: string; type: 'Top-up' | 'Invoice' | 'Adjust'; delta: number; balanceAfter: number; currency?: Currency; amount?: number; receiptUrl?: string };
type Company = { name: string; vat?: string; reg?: string; address1?: string; city?: string; country?: string; iban?: string; bic?: string };
type Me = { id: string; name: string | null; email: string | null; tokenBalance: number; currency: Currency; company: Company | null };

const currencySym = (c: Currency) => (c === 'GBP' ? '£' : '€');
const fmtMoney = (n: number, c: Currency) => {
  const sym = currencySym(c);
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  try { return `${n < 0 ? '-' : ''}${sym}${new Intl.NumberFormat(undefined, opts).format(abs)}`; } catch { return `${sym}${abs.toFixed(2)}`; }
};

function money(n: number, c: Currency) {
  const sym = c === 'GBP' ? '£' : '€';
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  try { return `${n < 0 ? '-' : ''}${sym}${new Intl.NumberFormat(undefined, opts).format(abs)}`; } catch { return `${sym}${abs.toFixed(2)}`; }
}
function int(n: number) { try { return new Intl.NumberFormat().format(Math.round(n)); } catch { return String(Math.round(n)); } }

export default function DashboardClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [invRange, setInvSlice] = useState<[number, number]>([0, 20]);
  const [ledRange, setLedSlice] = useState<[number, number]>([0, 20]);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [form, setForm] = useState<Company>({ name: '' });

  // load data
  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/me');
      if (meRes.ok) {
        const { user } = await meRes.json();
        setMe(user);
        setForm(user.company || { name: '' });
      }
      const invRes = await fetch('/api/invoices');
      if (invRes.ok) {
        const { invoices } = await invRes.json();
        setInvoices(invoices);
      }
      const ledRes = await fetch('/api/ledger');
      if (ledRes.ok) {
        const { ledger } = await ledRes.json();
        setLedger(ledger);
      }
    })();
  }, []);

  const createInvoice = async () => {
    if (!me) return;
    if (me.tokenBalance < 10) { alert('Not enough tokens. Top up to create a new invoice.'); return; }
    const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: me.currency, client: 'New Client', subtotal: 100, tax: 20, total: 120 }) });
    if (res.ok) {
      const { invoice, tokenBalance } = await res.json();
      setInvoices(prev => [ { ...invoice, date: new Date(invoice.date).toISOString().slice(0,10) }, ...prev ]);
      setMe({ ...me, tokenBalance });
      // refresh ledger
      const ledRes = await fetch('/api/ledger');
      if (ledRes.ok) {
        const { ledger } = await ledRes.json();
        setLedger(ledger);
      }
    } else {
      const j = await res.json().catch(()=>({ error:'Error'}));
      alert(j.error || 'Error creating invoice');
    }
  };

  const topUp = async (amount: number) => {
    if (!me) return;
    const res = await fetch('/api/ledger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'Top-up', amount, currency: me.currency }) });
    if (res.ok) {
      const { tokenBalance } = await res.json();
      setMe({ ...me, tokenBalance });
      const ledRes = await fetch('/api/ledger');
      if (ledRes.ok) {
        const { ledger } = await ledRes.json();
        setLedger(ledger);
      }
    } else {
      alert('Top-up failed');
    }
  };

  const saveCompanyProfile = async (next: Company) => {
    setSavingCompany(true);
    const res = await fetch('/api/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    if (res.ok) {
      const { company } = await res.json();
      setForm(company);
      setSavingCompany(false);
      setSavedBanner('Company profile saved. New invoices will use these details as the seller.');
      setTimeout(() => setSavedBanner(null), 2500);
    } else {
      setSavingCompany(false);
      alert('Failed to save company');
    }
  };

  const userName = me?.name || 'User';
  const currency = (me?.currency || 'GBP') as Currency;
  const tokenBalance = me?.tokenBalance ?? 0;
  const invView = invoices.slice(invRange[0], invRange[1]);
  const ledgerView = ledger.slice(ledRange[0], ledRange[1]);

  return (
    <main className="bg-slate-50 min-h-screen">
      <style>{`.reveal-in{opacity:1;transform:translateY(0);filter:blur(0)}[data-reveal]{opacity:0;transform:translateY(6px);filter:blur(4px);transition:all .45s ease}`}</style>
      <Section className="py-6">
        {/* Greeting & balance (compact, без буллетов) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hello, {userName}</h1>
            <p className="mt-1 text-slate-600">Manage your invoices, token balance, and company details.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-sm rounded-full border border-black/10 bg-white px-3 py-1">Balance: <b>{int(tokenBalance)}</b> tokens <span className="text-slate-500">(~{int(tokenBalance/10)} invoices)</span></div>
            <Button onClick={() => topUp(10)} size="md" variant="primary">Top up {currencySym(currency)}10</Button>
            <a href="#company-settings" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm">Company settings</a>
          </div>
        </div>
        {/* Убрали блок быстрых действий, чтобы избежать лишних пустот */}

        {/* Две колонки на одном уровне: инвойсы слева, история токенов справа */}
        <div className="mt-4 grid lg:grid-cols-2 gap-4 items-start">
          <Card padding="sm" data-reveal>
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">Recent invoices</div>
                <a className="text-sm underline" href="#">View all</a>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-3 py-2">Number</th>
                      <th className="text-left px-3 py-2">Date</th>
                      <th className="text-left px-3 py-2">Client</th>
                      <th className="text-right px-3 py-2">Total</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-right px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invView.map(inv => (
                      <tr key={inv.id} className="border-t border-black/10">
                        <td className="px-3 py-2 font-mono text-[12px]">{inv.number}</td>
                        <td className="px-3 py-2">{new Date(inv.date).toISOString().slice(0,10)}</td>
                        <td className="px-3 py-2">{inv.client}</td>
                        <td className="px-3 py-2 text-right">{fmtMoney(inv.total, inv.currency)}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] border ${inv.status==='Paid'?'border-emerald-200 bg-emerald-50 text-emerald-800':inv.status==='Sent'?'border-blue-200 bg-blue-50 text-blue-800':inv.status==='Overdue'?'border-rose-200 bg-rose-50 text-rose-800':'border-black/10'}`}>{inv.status}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button className="text-sm underline mr-2">View</button>
                          <button className="text-sm underline">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
                 {/* Пагинация инвойсов */}
                 <InvoicePager total={invoices.length} pageSize={20} onSlice={(from, to)=>setInvSlice([from,to])} />
              </div>
          </Card>

          <Card padding="sm" data-reveal>
              <div className="text-base font-semibold">Token history</div>
              <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-3 py-2">Date</th>
                      <th className="text-left px-3 py-2">Type</th>
                      <th className="text-right px-3 py-2">Delta</th>
                      <th className="text-right px-3 py-2">Balance</th>
                      <th className="text-right px-3 py-2">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerView.map(row => (
                      <tr key={row.id} className="border-t border-black/10">
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(row.ts).toLocaleString()}</td>
                        <td className="px-3 py-2">{row.type}</td>
                        <td className={`px-3 py-2 text-right ${row.delta>0?'text-emerald-700':'text-slate-900'}`}>{row.delta>0? `+${int(row.delta)}` : `-${int(Math.abs(row.delta))}`} tokens</td>
                        <td className="px-3 py-2 text-right">{int(row.balanceAfter)}</td>
                        <td className="px-3 py-2 text-right">{row.type==='Top-up'? <a className="underline text-sm" href={row.receiptUrl||'#'}>Receipt</a> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
                 {/* Пагинация леджера */}
                 <LedgerPager total={ledger.length} pageSize={20} onSlice={(from,to)=>setLedSlice([from,to])} />
              </div>
          </Card>
        </div>

        {/* Company settings ниже, на всю ширину */}
        <div className="mt-6 scroll-mt-24" id="company-settings">
            <Card padding="sm">
              <div className="text-base font-semibold">Company settings</div>
              <p className="text-sm text-slate-600 mt-1">Saved details will be used as the seller on your invoices.</p>
              {savedBanner && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm p-3">{savedBanner}</div>}
              <form className="mt-4 grid gap-3" onSubmit={(e)=>{e.preventDefault(); saveCompanyProfile(form);}}>
                <Input label="Company name" value={form.name||''} onChange={(e)=>setForm({...form, name:e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="VAT" value={form.vat||''} onChange={(e)=>setForm({...form, vat:e.target.value})} placeholder="GB123456789" />
                  <Input label="Reg" value={form.reg||''} onChange={(e)=>setForm({...form, reg:e.target.value})} />
                </div>
                <Input label="Address line" value={form.address1||''} onChange={(e)=>setForm({...form, address1:e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" value={form.city||''} onChange={(e)=>setForm({...form, city:e.target.value})} />
                  <Input label="Country" value={form.country||''} onChange={(e)=>setForm({...form, country:e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="IBAN" value={form.iban||''} onChange={(e)=>setForm({...form, iban:e.target.value})} placeholder={currency==='GBP'? 'GB00 BANK 0000 0000 0000 00' : 'DE00 BANK 0000 0000 0000 00'} />
                  <Input label="BIC" value={form.bic||''} onChange={(e)=>setForm({...form, bic:e.target.value})} placeholder="BANKGB2L" />
                </div>
                <div className="mt-2">
                  <Button disabled={savingCompany} variant="primary">{savingCompany? 'Saving…' : 'Save company'}</Button>
                </div>
              </form>
            </Card>
        </div>
      </Section>
    </main>
  );
}

function TablePager({ total, pageSize = 20, onSlice }: { total: number; pageSize?: number; onSlice: (from: number, to: number) => void }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const from = Math.min((page - 1) * pageSize, Math.max(0, total - (total % pageSize || pageSize)));
    const to = Math.min(from + pageSize, total);
    onSlice(from, to);
  }, [page, total, pageSize, onSlice]);

  if (total <= pageSize) return null;

  return (
    <div className="flex items-center justify-between p-3">
      <div className="text-xs text-slate-600">Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <div className="text-xs text-slate-600">{page} / {pages}</div>
        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
      </div>
    </div>
  );
}

const InvoicePager = TablePager;
const LedgerPager = TablePager;
