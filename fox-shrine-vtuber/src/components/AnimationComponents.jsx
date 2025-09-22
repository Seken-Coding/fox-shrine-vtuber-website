import { motion } from 'framer-motion';

// Reusable animation variants
export const fadeInFromTop = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 }
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

// Container for staggered animations
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Transition configurations
export const smoothTransition = {
  duration: 0.6,
  ease: [0.25, 0.25, 0.25, 0.75]
};

export const quickTransition = {
  duration: 0.3,
  ease: "easeOut"
};

// Animated wrapper components
export const AnimatedSection = ({ children, delay = 0, className = "", ...props }) => (
  <motion.section
    initial={false}
    animate="animate"
    variants={fadeInUp}
    transition={{ ...smoothTransition, delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.section>
);

export const AnimatedContainer = ({ children, className = "", ...props }) => (
  <motion.div
    initial={false}
    animate="animate"
    variants={staggerContainer}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedCard = ({ children, index = 0, className = "", hover = true, ...props }) => (
  <motion.div
    variants={fadeInUp}
    transition={{ ...smoothTransition, delay: index * 0.1 }}
    whileHover={hover ? { scale: 1.02, y: -5 } : {}}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeInFromTop = ({ children, delay = 0, className = "", ...props }) => (
  <motion.div
    initial={false}
    animate="animate"
    variants={fadeInFromTop}
    transition={{ ...smoothTransition, delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideInFromLeft = ({ children, delay = 0, className = "", ...props }) => (
  <motion.div
    initial={false}
    animate="animate"
    variants={slideInFromLeft}
    transition={{ ...smoothTransition, delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Page header animation
export const AnimatedPageHeader = ({ title, description, delay = 0 }) => (
  <FadeInFromTop delay={delay} className="text-center mb-12">
    <h1 className="font-cinzel text-4xl md:text-5xl text-shrine-red mb-8">
      {title}
    </h1>
    {description && (
      <p className="text-xl max-w-3xl mx-auto">
        {description}
      </p>
    )}
  </FadeInFromTop>
);

// Shrine card variants
export const ShrineCard = ({ children, className = "", index = 0, hover = true, ...props }) => (
  <AnimatedCard
    index={index}
    hover={hover}
    className={`shrine-card ${className}`}
    {...props}
  >
    {children}
  </AnimatedCard>
);

const AnimationComponentsLibrary = {
  AnimatedSection,
  AnimatedContainer,
  AnimatedCard,
  ShrineCard,
  FadeInFromTop,
  SlideInFromLeft,
  AnimatedPageHeader,
  fadeInFromTop,
  slideInFromLeft,
  fadeInUp,
  scaleIn,
  staggerContainer,
  smoothTransition,
  quickTransition
};

export default AnimationComponentsLibrary;
