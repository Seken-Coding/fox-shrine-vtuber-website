import { useState, useEffect } from 'react';

const FoxEasterEgg = () => {
  const [showFox, setShowFox] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    let konami = [];
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyDown = (e) => {
      konami.push(e.key);
      konami = konami.slice(-10);
      
      if (konami.join(',') === konamiCode.join(',')) {
        triggerFox();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const triggerFox = () => {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    
    setPosition({ x, y });
    setShowFox(true);
    
    setTimeout(() => {
      setShowFox(false);
    }, 3000);
  };
  
  return (
    <>
      {showFox && (
        <div 
          className="fixed z-50 transition-opacity duration-300"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            opacity: showFox ? 1 : 0
          }}
        >
          <img 
            src="/decorative/fox-surprise.gif" 
            alt="Surprise Fox!" 
            className="w-24 h-auto"
          />
        </div>
      )}
    </>
  );
};

export default FoxEasterEgg;