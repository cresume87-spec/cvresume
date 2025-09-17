'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { Zap, ShieldCheck, PenLine, Sparkles, Coins, Share2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Resume in 10 minutes',
    desc: 'Build a professional document in a few clicks — clear structure and strong wording.',
  },
  {
    icon: ShieldCheck,
    title: 'ATS-friendly templates',
    desc: 'Layouts designed to pass applicant tracking systems and please recruiters.',
  },
  {
    icon: PenLine,
    title: 'Pre-written content',
    desc: 'Curated phrases and bullet points for popular roles.',
  },
  {
    icon: Sparkles,
    title: 'Subtle guidance',
    badge: 'AI-assisted',
    desc: 'Smart suggestions turn notes into clear bullets and summaries.',
  },
  {
    icon: Coins,
    title: 'Pay only for what you use',
    desc: 'Tokens instead of a subscription. No hidden fees.',
  },
  {
    icon: Share2,
    title: 'Export & share',
    desc: 'PDF/DOCX and a shareable link — send your resume right away.',
  },
];

export default function WhyUs() {
  return (
    <Section id="why-us" className="py-12">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Why choose us</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, index) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md" padding="md">
                <div className="flex items-center gap-2">
                  <Icon size={20} className="opacity-80 text-[#0F172A]" aria-hidden="true" />
                  <h3 className="font-semibold text-lg">
                    {f.title}
                    {f.badge && (
                      <sup className="ml-2 align-super text-[10px] px-1.5 py-0.5 rounded-full bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/30">{f.badge}</sup>
                    )}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-700">{f.desc}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}


