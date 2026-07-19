import { useState, useEffect } from "react";

export default function NavProgressRunner({ isFinished }) {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let current = 15;
    setProgress(current);

    const interval = setInterval(() => {
      if (isFinished) return;
      const inc = Math.random() * 15 + 1;
      current += inc;
      if (current > 90) current = 90;
      setProgress(current);
    }, 300);

    return () => clearInterval(interval);
  }, [isFinished]);

  useEffect(() => {
    if (isFinished) {
      setProgress(100);
      const timer = setTimeout(() => {
        setOpacity(0);
      }, 400); // Wait for the 400ms width transition to finish before fading out
      return () => clearTimeout(timer);
    } else {
      setOpacity(1);
      setProgress(15);
    }
  }, [isFinished]);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-9999 pointer-events-none transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* The actual progress bar */}
      <div 
        className="relative h-full bg-accent transition-all ease-out shadow-[0_0_8px_var(--accent-light),0_0_4px_var(--accent)]"
        style={{ 
          width: `${progress}%`,
          transitionDuration: '400ms'
        }}
      >
        {/* The scaled down runner attached to the tip */}
        <div 
          className="absolute right-0 top-1/2" 
          style={{ transform: 'translate(50%, -50%) scale(0.3)', transformOrigin: 'center', width: '60px', height: '80px' }}
        >
          <div className="geo-runner w-full h-full relative" style={{ animation: 'smooth-bounce 0.6s ease-in-out infinite alternate' }}>
            <div className="geo-arm back"></div>
            <div className="geo-leg back"></div>
            <div className="geo-torso"></div>
            <div className="geo-head"></div>
            <div className="geo-arm front"></div>
            <div className="geo-leg front"></div>
            
            {/* Speed dashes trailing behind the runner */}
            <div className="geo-dash" style={{ bottom: '20px', left: '100px' }}></div>
            <div className="geo-dash"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
