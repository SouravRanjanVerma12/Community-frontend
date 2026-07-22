import { motion } from 'framer-motion';

const sizes = { sm: 0.25, md: 0.35, lg: 0.5 };
const dimensions = { sm: 16, md: 24, lg: 32 };

export default function Spinner({ size = 'md', color = 'var(--accent)' }) {
  const scale = sizes[size] ?? sizes.md;
  const dim = dimensions[size] ?? dimensions.md;
  
  return (
    <div 
      className="inline-flex items-center justify-center shrink-0 relative overflow-visible" 
      style={{ width: dim, height: dim }}
    >
      <div 
        className="absolute left-1/2 top-1/2" 
        style={{ transform: `translate(-50%, -40%) scale(${scale})` }}
      >
        <div className="geo-runner w-full h-full relative" style={{ animation: 'smooth-bounce 0.6s ease-in-out infinite alternate' }}>
          <div className="geo-arm back"></div>
          <div className="geo-leg back"></div>
          <div className="geo-torso"></div>
          <div className="geo-head" style={{ background: color }}></div>
          <div className="geo-arm front"></div>
          <div className="geo-leg front" style={{ background: color }}></div>
        </div>
      </div>
    </div>
  );
}
