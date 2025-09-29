import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

// A lightweight page wrapper that mirrors SchedulePage's feel:
// simple fade + slight Y slide on mount. No blocking overlay.
const PageTransition = ({ children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;