"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { THEME } from '@/lib/theme';

const STEPS = [
  {
    title: 'Create quality documents in minutes',
    description: 'Modern templates that read well for hiring teams and pass applicant tracking systems.',
  },
  {
    title: 'Guided writing',
    description: 'Friendly prompts and ready-made phrasing to keep things concise and professional.',
  },
  {
    title: 'Edit, preview, export',
    description: 'Work in your dashboard, preview on A4, download PDF/DOCX when you\'re ready.',
  },
  {
    title: 'Fair pricing with tokens',
    description: 'Top up once, spend only on actions you need (create, improve, export).',
  },
];

const PILLARS = [
  {
    title: 'Pillar A - Structure first',
    description: 'Every template enforces a clean visual rhythm, consistent spacing, and clear hierarchy.',
  },
  {
    title: 'Pillar B - Measurable results',
    description: 'We nudge users to add impact: numbers, deltas, and outcomes that matter to recruiters.',
  },
  {
    title: 'Pillar C - Frictionless export',
    description: 'Live A4 preview and print-safe typography ensure your PDF looks exactly as expected.',
  },
];

const PRINCIPLES = [
  {
    title: 'Clarity over flair',
    description: 'We prefer readable layouts to heavy decoration.',
  },
  {
    title: 'Respect for time',
    description: 'Few steps, fast preview, quick export.',
  },
  {
    title: 'Own your data',
    description: 'You control what\'s stored and when it\'s deleted.',
  },
  {
    title: 'No lock-in',
    description: 'Tokens, not subscriptions; export to open formats anytime.',
  },
];

const TRUST_ITEMS = [
  {
    title: 'Data protection',
    description: 'All data in transit is encrypted; infrastructure hosted in the UK/EU with GDPR compliance.',
  },
  {
    title: 'Minimal data collection',
    description: 'We store only what\'s needed to deliver the service. No full card data on our servers.',
  },
  {
    title: 'Account controls',
    description: 'Download your data, request deletion from your account.',
  },
  {
    title: 'Operational security',
    description: 'Regular updates and internal reviews; production access is restricted by role.',
  },
];

const COMPANY_DETAILS = [
  'EVERFINA LTD',
  'Company number: 15645711',
  '20 Wenlock Road, London, England, N1 7GU',
  'General enquiries: info@makemy-cv.co.uk',
];

export default function AboutPageClient() {
  return (
    <div className="min-h-screen">
      <Section className="pt-12 pb-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={`text-4xl sm:text-5xl font-bold leading-tight ${THEME.text}`}>
            We help people land interviews with better CVs and resumes - faster.
          </h1>
          <p className={`mt-6 text-lg ${THEME.muted}`}>
            CVBuilder turns your experience into a clear, ATS-friendly document you can create, edit, and export in minutes. Pay only for what you use with simple tokens.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/create-cv" size="lg">Get started</Button>
            <Button href="/pricing" variant="outline" size="lg">View pricing</Button>
          </div>
        </motion.div>
      </Section>

      <Section className="py-20 bg-slate-50/60">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>What we do</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {STEPS.map((step) => (
              <Card key={step.title} className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <h2 className={`text-3xl font-bold ${THEME.text}`}>Our approach</h2>
            <p className={`mt-4 text-base ${THEME.muted}`}>
              Short, practical, and transparent. We focus on the parts that actually impact outcomes - structure, wording, and clarity.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <Card key={pillar.title} className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20 bg-slate-50/60">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>Our principles</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <Card key={principle.title} className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">{principle.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{principle.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>Trust & Security</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {TRUST_ITEMS.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="outline" href="/security">Security details</Button>
            <Button variant="outline" href="/status">Service status</Button>
          </div>
        </motion.div>
      </Section>

      <Section className="py-20 bg-slate-50/60">
        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold text-center ${THEME.text}`}>Company details</h2>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
            {COMPANY_DETAILS.map((line) => (
              <div key={line} className="py-1 text-center">
                {line}
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text}`}>Resume & CV templates</h2>
            <p className={`mt-3 text-base ${THEME.muted}`}>Explore clean, ATS-friendly layouts that keep your achievements front and center.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="overflow-hidden border border-slate-200 bg-white">
                <div className="aspect-[1/1.414] w-full bg-slate-100" />
                <div className="p-4">
                  <div className="text-sm font-semibold text-slate-900">Template {item}</div>
                  <p className="mt-1 text-xs text-slate-600">Balanced typography, clear sections, ATS-friendly.</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Drag & drop editor</span>
                    <Link href="/create-cv" className="font-semibold text-slate-900 hover:underline">
                      Preview
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="py-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold ${THEME.text}`}>Questions? We\'re here to help</h2>
          <p className={`mt-4 text-base ${THEME.muted}`}>Get in touch with our team for support, partnerships, or media inquiries.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact" size="lg">Contact us</Button>
            <Button href="/pricing" variant="outline" size="lg">View pricing</Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
