import { motion } from 'framer-motion';

// A lightweight page wrapper that mirrors SchedulePage's feel:
// simple fade + slight Y slide on mount. No blocking overlay.
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;