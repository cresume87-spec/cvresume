'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/layout/Section';

const LOGOS = [
  { id: 'amazon', src: '/Amazon_logo.svg', alt: 'Amazon' },
  { id: 'apple', src: '/Apple_logo_black.svg', alt: 'Apple' },
  { id: 'dhl', src: '/DHL_Logo.svg', alt: 'DHL' },
  { id: 'dpd', src: '/DPD_logo_(2015).svg', alt: 'DPD' },
  { id: 'lufthansa', src: '/Lufthansa-Logo_1964.svg', alt: 'Lufthansa' },
  { id: 'samsung', src: '/Samsung_Logo.svg', alt: 'Samsung' },
];

export default function TrustedBy() {
  const reduce = useReducedMotion();
  return (
    <Section className="py-12">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold">Our candidates have been hired by:</h2>
      </motion.div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {LOGOS.map((logo, i) => (
          <LogoTile key={logo.id} index={i} reduce={reduce} src={logo.src} alt={logo.alt} />
        ))}
      </div>

      {/* Mobile marquee */}
      <div className="sm:hidden overflow-hidden relative mt-2">
        <div
          className={`flex gap-6 items-center ${reduce ? '' : 'animate-[marquee_14s_linear_infinite]'} hover:[animation-play-state:paused]`}
          aria-label="Hired by marquee"
        >
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <LogoMono key={`${logo.id}-${i}`} src={logo.src} alt={logo.alt} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function LogoTile({ index, reduce, src, alt }: { index: number; reduce: boolean | null; src: string; alt: string }) {
  return (
    <motion.div
      className="group h-12 flex items-center justify-center rounded-xl border border-black/5 bg-white"
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 * index }}
      whileHover={reduce ? undefined : { y: -6, scale: 1.03, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      viewport={{ once: true }}
    >
      <img src={src} alt={alt} className="max-h-7 w-auto opacity-80" />
    </motion.div>
  );
}

function LogoMono({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="inline-flex items-center justify-center h-[22px] w-[120px] rounded bg-white border border-black/5">
      <img src={src} alt={alt} className="max-h-6 w-auto opacity-80" />
    </div>
  );
}


