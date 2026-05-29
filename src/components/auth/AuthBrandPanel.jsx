import { motion } from 'framer-motion';

const CHIPS = [
  { label: '<Code />', x: '10%', y: '16%', delay: 0 },
  { label: '{learn}', x: '62%', y: '10%', delay: 0.6 },
  { label: '#buildinpublic', x: '52%', y: '28%', delay: 1.2 },
  { label: 'follow →', x: '6%', y: '40%', delay: 0.3 },
  { label: 'share()', x: '68%', y: '50%', delay: 0.9 },
  { label: '// build', x: '18%', y: '60%', delay: 1.5 },
  { label: 'open source', x: '48%', y: '68%', delay: 0.4 },
  { label: 'const you', x: '12%', y: '76%', delay: 1.0 },
  { label: 'grow()', x: '65%', y: '80%', delay: 0.7 },
  { label: 'devs 🚀', x: '32%', y: '86%', delay: 1.3 },
];

function FloatingChip({ label, x, y, delay }) {
  return (
    <motion.span
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: '12px',
        fontFamily: 'var(--mono)',
        color: 'rgba(124,58,237,0.55)',
        background: 'rgba(124,58,237,0.07)',
        border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: '6px',
        padding: '4px 10px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      animate={{
        y: [0, -10, 0, 8, 0],
        opacity: [0.45, 0.80, 0.5, 0.85, 0.45],
      }}
      transition={{
        duration: 6 + delay,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {label}
    </motion.span>
  );
}

export default function AuthBrandPanel() {
  return (
    <div
      style={{
        flex: '0 0 55%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 45%, #faf5ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(124,58,237,0.14) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* Soft radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating chips */}
      {CHIPS.map((chip) => (
        <FloatingChip key={chip.label} {...chip} />
      ))}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}
      >
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.30)',
            marginBottom: '28px',
            fontSize: '28px',
          }}
        >
          ⚡
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: '40px',
            fontWeight: '800',
            letterSpacing: '-1.5px',
            lineHeight: '1.1',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          DevCommunity
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: '17px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '36px',
          }}
        >
          Where developers learn,&nbsp;
          <span style={{ color: '#7c3aed', fontWeight: '600' }}>share</span>
          &nbsp;ideas, and&nbsp;
          <span style={{ color: '#7c3aed', fontWeight: '600' }}>grow</span>
          &nbsp;together.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          style={{ display: 'flex', gap: '32px', justifyContent: 'center' }}
        >
          {[
            { value: '12K+', label: 'Developers' },
            { value: '4K+', label: 'Posts' },
            { value: '80+', label: 'Topics' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.5px',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
