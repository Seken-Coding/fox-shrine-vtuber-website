import React, { useState, useEffect } from 'react';

const PageTransition = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative">
      <div className={`fixed inset-0 z-50 bg-shrine-white transition-transform duration-800 flex items-center justify-center ${isLoading ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-32 h-32 relative">
          <img 
            src="/decorative/torii-gate.svg" 
            alt="Loading" 
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-fox-orange animate-ping"></div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default PageTransition;