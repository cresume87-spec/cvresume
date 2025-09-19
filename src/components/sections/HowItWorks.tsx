'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';

const STEPS: { title: string; desc: string }[] = [
  { title: 'Create profile', desc: 'Add your details once: contacts, links, skills.' },
  { title: 'Pick a template', desc: 'Choose a formal, universal or creative layout.' },
  { title: 'Add experience', desc: 'Summarize roles and achievements with guidance.' },
  { title: 'Export & share', desc: 'Export PDF or DOCX and send it confidently.' },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();
  return (
    <Section id="how" className="py-12">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
        <p className="mt-2 text-slate-600">4 simple steps from profile to export.</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ delay: reduceMotion ? 0 : i * 0.05, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="h-full" padding="md">
              <div className="text-xs text-slate-500">Step {i + 1}</div>
              <div className="mt-1 font-semibold">{s.title}</div>
              <div className="mt-1 text-sm text-slate-700">{s.desc}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

