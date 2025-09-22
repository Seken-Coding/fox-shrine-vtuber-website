import { useEffect } from 'react';

const SakuraPetals = () => {
  useEffect(() => {
    const createPetal = () => {
      const petal = document.createElement('div');
      petal.classList.add('sakura-petal');
      
      const size = Math.random() * 15 + 10;
      const rotation = Math.random() * 360;
      const xPos = Math.random() * window.innerWidth;
      const duration = Math.random() * 10 + 5;
      
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.8}px`;
      petal.style.left = `${xPos}px`;
      petal.style.transform = `rotate(${rotation}deg)`;
      petal.style.animationDuration = `${duration}s`;
      
      document.getElementById('sakura-container').appendChild(petal);
      
      setTimeout(() => {
        petal.remove();
      }, duration * 1000);
    };
    
    const petalInterval = setInterval(createPetal, 300);
    
    return () => clearInterval(petalInterval);
  }, []);
  
  return (
    <>
      <style>{`
        .sakura-petal {
          position: absolute;
          background: linear-gradient(45deg, #ffb7c5, #ffc0cb);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          top: -20px;
          opacity: 0.6;
          animation-name: falling;
          animation-timing-function: ease-in-out;
          animation-iteration-count: 1;
        }
        
        @keyframes falling {
          0% {
            top: -20px;
            transform: translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            top: 110vh;
            transform: translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      <div id="sakura-container" className="fixed inset-0 z-10 pointer-events-none"></div>
    </>
  );
};

export default SakuraPetals;