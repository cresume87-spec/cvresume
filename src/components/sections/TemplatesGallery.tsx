'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const FILTERS = ['IT','Finance','Marketing','Design','Formal','Universal','Creative','EN','LV','RU','DE'];

export default function TemplatesGallery() {
  return (
    <Section id="templates" className="py-10">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Resume & CV templates</h2>
        <p className="mt-2 text-slate-600">Formal, universal and creative вЂ” for any industry.</p>
      </motion.div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {FILTERS.map((f) => (
          <button key={f} className="rounded-full border border-slate-300 bg-white px-3 py-1 hover:bg-slate-100">
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3">
            <div className="aspect-[1/1.414] w-full rounded-lg border border-dashed border-slate-300 bg-slate-50" />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>ATSвЂ‘friendly В· 1вЂ“2 pages</span>
              <span>EN/LV/RU</span>
            </div>
            <div className="mt-3 flex gap-2">
              <a className="flex-1" href="/templates"><Button variant="outline" className="w-full">Preview</Button></a>
              <a className="flex-1" href="/generator"><Button variant="secondary" className="w-full">Use template</Button></a>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}


