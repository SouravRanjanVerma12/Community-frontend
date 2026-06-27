import { motion } from 'framer-motion';

const sizes = { sm: 16, md: 20, lg: 28 };

export default function Spinner({ size = 'md', color = 'currentColor' }) {
  const px = sizes[size] ?? sizes.md;
  return (
    <motion.svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      className="inline-block shrink-0"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
