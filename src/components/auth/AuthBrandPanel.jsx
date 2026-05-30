import { motion } from 'framer-motion';

const LOGIN_CHIPS  = ['<Code />', '{learn}', '#buildinpublic', 'const you', 'share()', 'open source'];
const REGISTER_CHIPS = ['follow →', '// build', 'devs 🚀', '<Ship />', 'collaborate()', 'grow()'];

export default function AuthBrandPanel({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const chips = isRegister ? REGISTER_CHIPS : LOGIN_CHIPS;

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 52px',
        background: 'var(--auth-panel-bg)',
        minHeight: '100%',
      }}
    >
      {/* Grid overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--auth-panel-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--auth-panel-grid) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* Radial glow orb */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          top: '-80px',
          left: '10%',
          background: `radial-gradient(circle, var(--auth-panel-glow) 0%, transparent 65%)`,
          filter: 'blur(50px)',
          pointerEvents: 'none',
          animation: 'authGlow 6s ease-in-out infinite',
        }}
      />

      {/* Main content — bottom-aligned */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Logo badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--auth-badge-bg)',
            border: '1px solid var(--auth-badge-border)',
            borderRadius: '14px',
            padding: '9px 15px',
            marginBottom: '28px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              boxShadow: '0 3px 12px rgba(124,58,237,0.40)',
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--auth-headline)',
              letterSpacing: '-0.2px',
            }}
          >
            DevCommunity
          </span>
        </motion.div>

        {/* Chip row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '24px' }}
        >
          {chips.map((chip, i) => (
            <span
              key={chip}
              style={{
                padding: '4px 11px',
                borderRadius: '20px',
                fontFamily: 'ui-monospace, Consolas, monospace',
                fontSize: '11px',
                background: 'var(--auth-chip-bg)',
                border: '1px solid var(--auth-chip-border)',
                color: 'var(--auth-chip-color)',
                animation: `chipFloat ${4.5 + i * 0.35}s ease-in-out ${i * 0.18}s infinite`,
              }}
            >
              {chip}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(1.9rem, 3vw, 2.9rem)',
            fontWeight: '900',
            lineHeight: '1.07',
            letterSpacing: '-1.8px',
            color: 'var(--auth-headline)',
            marginBottom: '16px',
          }}
        >
          {isRegister ? (
            <>
              Join the community<br />
              of{' '}
              <span
                style={{
                  background: 'var(--auth-headline-grad)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                builders.
              </span>
            </>
          ) : (
            <>
              Where developers<br />
              <span
                style={{
                  background: 'var(--auth-headline-grad)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                learn, build,
              </span>
              <br />
              and grow.
            </>
          )}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: '15px',
            color: 'var(--auth-desc)',
            lineHeight: '1.65',
            maxWidth: '360px',
            marginBottom: '32px',
          }}
        >
          {isRegister ? (
            <>
              Share what you're building. Learn from others.
              Grow alongside{' '}
              <strong style={{ color: 'var(--auth-desc-strong)', fontWeight: '600' }}>
                12,000+ developers
              </strong>{' '}
              who ship together.
            </>
          ) : (
            <>
              A community of{' '}
              <strong style={{ color: 'var(--auth-desc-strong)', fontWeight: '600' }}>
                12,000+ engineers
              </strong>{' '}
              sharing ideas, shipping code, and leveling up — together.
            </>
          )}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.46, duration: 0.6 }}
          style={{ display: 'flex', gap: '32px' }}
        >
          {(isRegister
            ? [{ value: '12K+', label: 'Developers' }, { value: '4K+', label: 'Posts' }, { value: 'Free', label: 'Always' }]
            : [{ value: '12K+', label: 'Developers' }, { value: '4K+', label: 'Posts' }, { value: '80+', label: 'Topics' }]
          ).map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: '21px',
                  fontWeight: '800',
                  letterSpacing: '-0.5px',
                  color: 'var(--auth-stat-value)',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--auth-stat-label)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  marginTop: '2px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes authGlow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.07); }
        }
        @keyframes chipFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (max-width: 768px) {
          .auth-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
