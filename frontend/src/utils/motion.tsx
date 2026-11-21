import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const transitionSmooth = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1.0] as const,
};

export const fadeUpVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionSmooth,
  },
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0.04) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const defaultViewport = {
  once: true,
  amount: 0.2 as const,
  margin: '0px 0px -40px 0px',
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function Reveal({ children, className = '', delay = 0, y = 16 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
