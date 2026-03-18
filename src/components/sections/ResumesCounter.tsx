'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { Files } from 'lucide-react';
import Section from '@/components/layout/Section';

function formatCount(value: number) {
  try {
    return new Intl.NumberFormat('en-GB').format(Math.max(0, Math.floor(value)));
  } catch {
    return String(Math.max(0, Math.floor(value)));
  }
}

export default function ResumesCounter() {
  const [count, setCount] = useState<number>(16356);
  const motionValue = useMotionValue(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/metrics/resumes', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;

        const nextCount = typeof payload?.count === 'number' ? payload.count : 16356;
        motionValue.set(Math.max(0, nextCount - 50));
        animationRef.current = animate(motionValue, nextCount, {
          duration: 0.9,
          ease: 'easeOut',
          onUpdate: (value) => setCount(Math.round(value)),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setCount(16356);
      });

    return () => {
      cancelled = true;
      try {
        animationRef.current?.stop();
      } catch {
        // Ignore cleanup failures.
      }
    };
  }, [motionValue]);

  return (
    <Section className="pt-4 pb-2">
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        <div
          className="mx-auto flex w-full max-w-3xl items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/90 px-4 py-3 text-center text-[#0e1f4d] sm:px-5 sm:py-3.5"
          aria-live="polite"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-500">
            <Files size={20} aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold tracking-tight sm:text-4xl">{formatCount(count)}</div>
            <div className="text-lg text-[#163a6d] sm:text-xl">resumes and CVs created</div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
