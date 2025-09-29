import { useEffect, useState } from 'react';

/**
 * Detects whether the user has requested reduced motion via media queries.
 * Returns true when reduced motion should be respected.
 */
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(query.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handleChange);
      return () => query.removeEventListener('change', handleChange);
    }

    query.addListener(handleChange);
    return () => query.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

export default usePrefersReducedMotion;
