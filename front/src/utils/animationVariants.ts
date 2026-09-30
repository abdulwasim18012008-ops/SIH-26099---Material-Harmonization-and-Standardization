import { Variants } from 'framer-motion';

/**
 * Parent container variant that staggers child cards by 50ms (within 40-60ms range)
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

/**
 * Card variant with subtle upward translate (y: 12 -> 0) and fade in
 * Short duration (0.28s - 0.3s) for crisp, snappy responsiveness
 */
export const staggerCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};
