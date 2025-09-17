'use client';

import { useEffect, useRef, useState } from 'react';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import DocumentA4 from '@/components/pdf/DocumentA4';

type Recipient = { name?: string; company?: string; email?: string; address?: string; city?: string; country?: string };

export default function DocumentForm({ signedIn }: { signedIn: boolean }) {
  const [title, setTitle] = useState('Untitled Document');
  const [recipient, setRecipient] = useState<Recipient>({ name: '', email: '' });
  const [content, setContent] = useState<Array<{ heading?: string; text?: string }>>([
    { heading: 'Section 1', text: 'Write something here…' },
  ]);
  const [notes, setNotes] = useState<string>('');
  const [busy, setBusy] = useState<null | 'save' | 'download' | 'email'>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try { bcRef.current = new BroadcastChannel('app-events'); } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const onAddBlock = () => setContent(prev => [...prev, { heading: `Section ${prev.length + 1}`, text: '' }]);
  const onRemoveBlock = (idx: number) => setContent(prev => prev.filter((_, i) => i !== idx));

  const createDocument = async () => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim() || 'Untitled Document',
        data: {
          documentDate: new Date().toISOString().slice(0, 10),
          recipient,
          content,
          notes,
        },
      }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to create document');
    return (await res.json()).document as { id: string; title: string };
  };

  const saveDoc = async () => {
    if (!signedIn) { alert('Sign in to save documents.'); return; }
    setBusy('save');
    try {
      await createDocument();
      alert('Document saved.');
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    } finally { setBusy(null); }
  };

  const downloadPdf = async () => {
    if (!signedIn) { alert('Sign in to download PDF.'); return; }
    setBusy('download');
    try {
      const doc = await createDocument();
      const res = await fetch(`/api/pdf/${doc.id}`);
      if (!res.ok) throw new Error('Server PDF failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${doc.title || 'Document'}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || 'Download failed');
    } finally { setBusy(null); }
  };

  const sendEmail = async () => {
    if (!signedIn) { alert('Sign in to send email.'); return; }
    if (!recipient.email) { alert('Add recipient email first.'); return; }
    setBusy('email');
    try {
      const doc = await createDocument();
      const res = await fetch('/api/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipient.email, documentId: doc.id }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Email failed');
      alert('Email sent successfully!');
    } catch (e: any) {
      alert(e?.message || 'Email failed');
    } finally { setBusy(null); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-5">
        <div className="grid gap-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Document" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Recipient name" value={recipient.name || ''} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} />
            <Input label="Recipient email" type="email" value={recipient.email || ''} onChange={(e) => setRecipient({ ...recipient, email: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="Address" value={recipient.address || ''} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} />
            <Input label="City" value={recipient.city || ''} onChange={(e) => setRecipient({ ...recipient, city: e.target.value })} />
            <Input label="Country" value={recipient.country || ''} onChange={(e) => setRecipient({ ...recipient, country: e.target.value })} />
          </div>

          <div className="mt-2">
            <div className="text-sm font-semibold">Content blocks</div>
            <div className="mt-2 grid gap-3">
              {content.map((b, i) => (
                <div key={i} className="rounded-xl border border-black/10 p-3 grid gap-2 bg-white">
                  <Input label="Heading" value={b.heading || ''} onChange={(e) => setContent(prev => prev.map((x, idx) => idx === i ? { ...x, heading: e.target.value } : x))} />
                  <Textarea label="Text" rows={3} value={b.text || ''} onChange={(e) => setContent(prev => prev.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => onRemoveBlock(i)}>Remove</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={onAddBlock}>+ Add block</Button>
            </div>
          </div>

          <Textarea label="Notes (optional)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="mt-2 flex flex-wrap gap-2">
            <Button onClick={saveDoc} disabled={busy !== null}>{busy === 'save' ? 'Saving…' : 'Save document'}</Button>
            <Button onClick={downloadPdf} disabled={busy !== null} variant="outline">{busy === 'download' ? 'Preparing…' : 'Download PDF'}</Button>
            <Button onClick={sendEmail} disabled={busy !== null} variant="outline">{busy === 'email' ? 'Sending…' : 'Send email'}</Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold mb-2">Live preview</div>
        <div className="border border-black/10 rounded-xl overflow-hidden">
          <DocumentA4
            title={title || 'Untitled Document'}
            documentDate={new Date().toISOString().slice(0,10)}
            recipient={recipient}
            content={content}
            notes={notes}
          />
        </div>
      </Card>
    </div>
  );
}



