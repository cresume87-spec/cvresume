'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';

const TESTIMONIALS = [
  { name: 'Alex J.', role: 'Product Lead', location: 'Berlin, DE', quote: 'MOCK: This tool streamlined our document workflow.' },
  { name: 'Sam T.', role: 'Operations', location: 'London, UK', quote: 'MOCK: Clean, fast, and easy to customize.' },
  { name: 'Rita M.', role: 'Founder', location: 'Lisbon, PT', quote: 'MOCK: We shipped docs in minutes without friction.' },
  { name: 'Chen W.', role: 'Consultant', location: 'Paris, FR', quote: 'MOCK: Great foundation for our internal templates.' },
  { name: 'Priya K.', role: 'Engineer', location: 'Dublin, IE', quote: 'MOCK: The PDF and email flow just works.' },
  { name: 'Diego S.', role: 'Freelancer', location: 'Madrid, ES', quote: 'MOCK: Neutral UI that fits any brand.' },
] as const;

export default function Testimonials() {
  return (
    <Section className="py-14">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Testimonials</h2>
        <p className="mt-2 text-slate-600">MOCK: Teams using a neutral doc skeleton</p>
      </motion.div>
      <Carousel />
    </Section>
  );
}

function Carousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const groupWidthRef = useRef(0);
  const speedRef = useRef(0.5);

  useEffect(() => {
    const setSpeed = () => {
      const w = window.innerWidth;
      speedRef.current = w < 640 ? 0.02 : 0.035;
    };
    setSpeed();
    window.addEventListener('resize', setSpeed);
    return () => window.removeEventListener('resize', setSpeed);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => { groupWidthRef.current = el.scrollWidth / 2; };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    let raf = 0; let x = 0; let last = performance.now();
    const loop = (now: number) => { const dt = now - last; last = now; if (!paused && groupWidthRef.current > 0) { x += speedRef.current * dt; if (x >= groupWidthRef.current) x -= groupWidthRef.current; el.style.transform = `translateX(-${x}px)`; } raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const list = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div ref={trackRef} className="flex gap-6 will-change-transform">
        {list.map((t, i) => (
          <div key={`${t.name}-${i}`} className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0">
            <Card hover>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-[11px] text-slate-500">{t.name[0]}</div>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role} · {t.location}</div>
                </div>
              </div>
              <p className="mt-4 text-slate-700 text-sm">{t.quote}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}



