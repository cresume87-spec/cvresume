'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';

export default function CTAVisual() {
  return (
    <div className="relative bg-[#0e1f4d] text-white">
      <Section className="py-12">
        <div className="grid md:grid-cols-2 items-center gap-8">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl sm:text-4xl font-bold leading-[1.1]">
              Create and edit your CV in just a few clicks and without limits.
            </h3>
            <p className="mt-3 text-slate-200 max-w-xl">
              Stand out with a stylish CV template and land the job of your dreams.
            </p>
            <div className="mt-6">
              <Button href="/generator?type=cv" size="lg" className="!bg-[#2563EB] !hover:bg-[#1E40AF] text-white">
                Create my CV
              </Button>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop"
                alt="Focused person creating a CV on a laptop"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {/* Scribble overlay */}
              <svg
                className="absolute -top-6 right-4 w-48 text-[#06B6D4] opacity-90"
                viewBox="0 0 200 80" fill="none" stroke="currentColor" strokeWidth="6"
                aria-hidden="true"
              >
                <path d="M5 40 C 40 5, 80 75, 120 20 S 180 60, 195 35" strokeLinecap="round" />
              </svg>
              {/* Pale corner shape */}
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-2xl bg-[#dff3f3]" aria-hidden="true" />
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
