"use client";

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Contacts } from '@/components/resume/types';

export function PreviewA4({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mx-auto aspect-[1/1.414] max-w-[794px] w-full bg-white print:w-[210mm] print:aspect-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Scaled A4 canvas for card previews so the full page is visible
const A4_BASE_WIDTH = 794; // px
const A4_BASE_HEIGHT = Math.round(A4_BASE_WIDTH * 1.4142);

export function ScaledA4({ children, maxScale = 1 }: { children: React.ReactNode; maxScale?: number }) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(A4_BASE_WIDTH);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => Math.min(width / A4_BASE_WIDTH, maxScale), [width, maxScale]);
  const height = Math.round(A4_BASE_HEIGHT * scale);

  return (
    <div ref={outerRef} className="w-full">
      <div className="relative" style={{ height }}>
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: A4_BASE_WIDTH, height: A4_BASE_HEIGHT, transform: `scale(${scale})` }}
        >
          <div className="h-full w-full bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Photo({ src, size = '28mm', rounded = 'full' as 'full' | 'lg' }: { src?: string; size?: string; rounded?: 'full' | 'lg' }) {
  return (
    <div
      className={rounded === 'full' ? 'overflow-hidden rounded-full border border-slate-200 bg-slate-100' : 'overflow-hidden rounded-lg border border-slate-200 bg-slate-100'}
      style={{ width: size, height: size }}
      aria-label="Profile photo"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9pt] text-slate-400">Photo</div>
      )}
    </div>
  );
}

export function ContactsBlock({ contacts, compact = false }: { contacts: Contacts; compact?: boolean }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 ${compact ? 'text-[9pt]' : 'text-[10pt]'} text-slate-600`}>
      <li>{contacts.email}</li>
      <li>• {contacts.phone}</li>
      <li>• {contacts.location}</li>
      {contacts.website && <li>• {contacts.website}</li>}
      {contacts.linkedin && <li>• {contacts.linkedin}</li>}
    </ul>
  );
}

export function Rule() {
  return <div className="my-4 h-px w-full bg-slate-200" />;
}

export function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h3 className="mb-1 text-[11pt] font-semibold uppercase tracking-wide text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

export function TwoCol({ children, gap = '8mm' }: { children: React.ReactNode; gap?: string }) {
  return (
    <div className="mt-1 grid" style={{ gridTemplateColumns: '1fr 1fr', columnGap: gap }}>
      {children}
    </div>
  );
}

export function Item({ title, meta, children }: { title: string; meta?: string; children?: React.ReactNode }) {
  return (
    <article className="mb-2">
      <div className="text-[10.5pt] font-semibold text-slate-900">{title}</div>
      {meta && <div className="text-[9pt] text-slate-500">{meta}</div>}
      {children && <div className="mt-1">{children}</div>}
    </article>
  );
}

export function Bullets({ items, tight = false }: { items: string[]; tight?: boolean }) {
  return (
    <ul className={`list-disc pl-5 text-[10pt] text-slate-700 ${tight ? 'space-y-0.5' : 'space-y-1'}`}>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

export function Tags({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span key={i} className={`rounded border border-slate-300 px-2 ${compact ? 'py-0.5 text-[8.5pt]' : 'py-1 text-[9.5pt]'} text-slate-700`}>
          {t}
        </span>
      ))}
    </div>
  );
}
