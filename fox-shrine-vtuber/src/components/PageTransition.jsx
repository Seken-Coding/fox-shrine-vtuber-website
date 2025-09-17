import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 z-50 bg-shrine-white flex items-center justify-center"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.25, 0.25, 0.25, 0.75] }}
          >
            <motion.div 
              className="w-32 h-32 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <img 
                src="/decorative/torii-gate.svg" 
                alt="Loading" 
                className="w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-6 h-6 rounded-full bg-fox-orange"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.4, delay: isLoading ? 0 : 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;