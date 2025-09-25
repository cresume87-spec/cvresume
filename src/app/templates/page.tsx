"use client";

import * as React from 'react';
import { PreviewA4 } from '@/components/resume/ui';
import { ResumeTemplates, type ResumeTemplateKey, sampleResumeData, sampleCVData, emptyResumeData, emptyCVData } from '@/components/resume';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function TemplatesPage() {
  const [docType, setDocType] = React.useState<'resume' | 'cv'>('resume');
  const [variant, setVariant] = React.useState<'mock' | 'empty'>('mock');

  const data = React.useMemo(() => {
    if (variant === 'mock') return docType === 'resume' ? sampleResumeData : sampleCVData;
    return docType === 'resume' ? emptyResumeData : emptyCVData;
  }, [docType, variant]);

  const templateKeys: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Templates — {docType.toUpperCase()} ({variant})</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2" value={docType} onChange={(e) => setDocType(e.target.value as 'resume' | 'cv')}>
              <option value="resume">Resume (1 page)</option>
              <option value="cv">CV (multi-page)</option>
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2" value={variant} onChange={(e) => setVariant(e.target.value as 'mock' | 'empty')}>
              <option value="mock">MOCK data</option>
              <option value="empty">Empty</option>
            </select>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {templateKeys.map((key) => {
            const T = ResumeTemplates[key];
            const title = labelForTemplate(key);
            return (
              <Card key={key} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">{title}</div>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <a className="underline" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Top</a>
                  </div>
                </div>
                <PreviewA4>
                  <T data={data} />
                </PreviewA4>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => window.open(window.location.href, '_blank')}>Open full</Button>
                  <a href={`/create-${docType}?template=${key}`} className="flex-1"><Button variant="secondary" className="w-full">Use template</Button></a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function labelForTemplate(k: ResumeTemplateKey) {
  switch (k) {
    case 'classic': return 'Classic ATS';
    case 'split': return 'Modern Split';
    case 'serif': return 'Elegant Serif';
    case 'tech': return 'Tech Compact';
    default: return k;
  }
}


