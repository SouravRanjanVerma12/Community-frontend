import React from "react";

export default function GlobalLoader({ isFinished, text = "LOADING", className = "" }) {
  const opacity = isFinished ? 0 : 1;
  return (
    <div 
      className={`relative w-48 h-48 flex items-center justify-center z-10 overflow-hidden transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      <div className="geo-runner scale-110">
        <div className="geo-arm back"></div>
        <div className="geo-leg back"></div>
        <div className="geo-torso"></div>
        <div className="geo-head"></div>
        <div className="geo-arm front"></div>
        <div className="geo-leg front"></div>
        <div className="geo-floor" style={{ left: '-10px', bottom: '0' }}></div>
        <div className="geo-dash" style={{ bottom: '20px', left: '100px' }}></div>
        <div className="geo-dash"></div>
      </div>
      
      {text && (
        <div className="absolute bottom-5 left-0 w-full text-center text-[10px] tracking-[0.2em] font-sans text-text-muted uppercase">
          {text}
        </div>
      )}
    </div>
  );
}
