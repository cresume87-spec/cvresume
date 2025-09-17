'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  onClick,
  href,
  disabled = false,
  title,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-4 transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-[#2563EB] hover:bg-[#1E40AF] text-white focus:ring-[#2563EB]/30',
    secondary: 'bg-slate-900 hover:bg-black text-white focus:ring-slate-900/30',
    outline: 'bg-white/80 backdrop-blur border border-[#E2E8F0] hover:bg-white text-[#0F172A] focus:ring-[#06B6D4]/20'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-5 py-3 text-base rounded-xl'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const buttonContent = (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      title={title}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        title={title}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.a>
    );
  }

  return buttonContent;
}
