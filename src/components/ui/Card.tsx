'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = `rounded-2xl bg-white border border-[#E2E8F0] shadow-sm ${paddingClasses[padding]} ${className}`;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
