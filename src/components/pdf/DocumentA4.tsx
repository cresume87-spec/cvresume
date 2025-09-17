import React from 'react';

type Party = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  vat?: string;
  address?: string;
  city?: string;
  country?: string;
  iban?: string;
  bankName?: string;
  bic?: string;
  logoUrl?: string;
};

type ContentBlock = { heading?: string; text?: string };

export default function DocumentA4({
  title,
  documentNo,
  documentDate,
  sender,
  recipient,
  content,
  notes,
  footerText,
}: {
  title: string;
  documentNo?: string;
  documentDate?: string;
  sender?: Party;
  recipient?: Party;
  content?: ContentBlock[];
  notes?: string;
  footerText?: string;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title || 'Document'}</h1>
            <div className="mt-1 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              {documentNo && <span>No: <b>{documentNo}</b></span>}
              {documentDate && <span>Date: <b>{documentDate}</b></span>}
            </div>
          </div>
          {sender?.logoUrl ? (
            <img src={sender.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
          ) : null}
        </header>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-black/10 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">From</div>
            <div className="mt-1 font-medium">{sender?.company || sender?.name || '—'}</div>
            <div className="mt-1 text-slate-600 space-y-0.5">
              {sender?.address && <div>{sender.address}</div>}
              {(sender?.city || sender?.country) && <div>{[sender.city, sender.country].filter(Boolean).join(', ')}</div>}
              {sender?.email && <div>{sender.email}</div>}
              {sender?.phone && <div>{sender.phone}</div>}
              {sender?.vat && <div>VAT: {sender.vat}</div>}
            </div>
            {(sender?.iban || sender?.bankName || sender?.bic) && (
              <div className="mt-2 text-slate-600 space-y-0.5">
                <div className="text-xs uppercase tracking-wide text-slate-500">Bank details</div>
                {sender?.bankName && <div>Bank: {sender.bankName}</div>}
                {sender?.iban && <div>IBAN: {sender.iban}</div>}
                {sender?.bic && <div>BIC: {sender.bic}</div>}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-black/10 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">To</div>
            <div className="mt-1 font-medium">{recipient?.company || recipient?.name || '—'}</div>
            <div className="mt-1 text-slate-600 space-y-0.5">
              {recipient?.address && <div>{recipient.address}</div>}
              {(recipient?.city || recipient?.country) && <div>{[recipient.city, recipient.country].filter(Boolean).join(', ')}</div>}
              {recipient?.email && <div>{recipient.email}</div>}
            </div>
          </div>
        </section>

        <main className="mt-6">
          <div className="rounded-lg border border-black/10">
            <div className="divide-y divide-black/10">
              {(content && content.length ? content : [{ heading: '', text: '—' }]).map((b, i) => (
                <div key={i} className="p-4">
                  {b.heading && <div className="text-sm font-semibold mb-1">{b.heading}</div>}
                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{b.text || ''}</div>
                </div>
              ))}
            </div>
          </div>
          {notes && (
            <div className="mt-3 text-xs text-slate-600">{notes}</div>
          )}
        </main>

        {footerText && (
          <footer className="mt-8 text-center text-[11px] text-slate-500">
            {footerText}
          </footer>
        )}
      </div>
    </div>
  );
}



