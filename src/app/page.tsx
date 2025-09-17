'use client';

import { motion } from 'framer-motion';
import Hero from '@/components/sections/Hero';
import ResumesCounter from '@/components/sections/ResumesCounter';
import TrustedBy from '@/components/sections/TrustedBy';
import Pricing from '@/components/sections/Pricing';
import WhyUs from '@/components/sections/WhyUs';
import HowItWorks from '@/components/sections/HowItWorks';
import TemplatesShowcase from '@/components/sections/TemplatesShowcase';
import CTAVisual from '@/components/sections/CTAVisual';

export default function HomePage() {
  return (
    <motion.div 
      className="bg-[#F8FAFC] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main>
        {/* 1. Hero */}
        <Hero />
        {/* 2. Counter (resumes created) */}
        <ResumesCounter />
        {/* 3. Trusted by */}
        <TrustedBy />
        {/* 4. Token top-up plans */}
        <Pricing />
        {/* 5. Why choose us */}
        <WhyUs />
        {/* 6. How it works */}
        <HowItWorks />
        {/* 7. Resume & CV templates */}
        <TemplatesShowcase />
        {/* 8. CTA block */}
        <CTAVisual />
        {/* Footer — already rendered by layout */}
      </main>
    </motion.div>
  );
}
