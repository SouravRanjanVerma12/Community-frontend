import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import bgPanel from '../../assets/auth-hero/bg-panel.png';

const LOGIN_CHIPS    = ['founders', '#startupIndia', 'ecosystem', 'growthTools', 'curatedResources'];
const REGISTER_CHIPS = ['community', 'buildInPublic', 'collab()', '<Builder />', 'scaleReady'];

export default function AuthBrandPanel({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const chips = isRegister ? REGISTER_CHIPS : LOGIN_CHIPS;

  return (
    <>
      {/* ── Full-viewport background image ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: '#02030a',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <img
          src={bgPanel}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        {/* Subtle grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
          maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 85%, transparent 100%)',
        }} />
      </div>

      {/* ── Left brand copy container ── */}
      <div
        aria-hidden
        className="auth-brand-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
            <div style={{
              position: 'absolute',
              left: 'min(132px, 9vw)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 'min(580px, 45vw)',
              zIndex: 2,
            }}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'left' }}
              >
                {/* "NEW" badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px', padding: '5px 14px 5px 6px',
                  marginBottom: '20px', backdropFilter: 'blur(10px)',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: '#fff', color: '#02030a', fontSize: '9px', fontWeight: '800',
                    letterSpacing: '0.06em', borderRadius: '12px', padding: '3px 9px',
                  }}>
                    <Sparkles size={9} fill="currentColor" /> NEW
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                    {isRegister ? 'Now open to every builder' : 'Latest ecosystem resources added'}
                  </span>
                </div>

                {/* Headline */}
                <h1
                  className="auth-display-font"
                  style={{
                    fontSize: 'clamp(2rem, 2.8vw, 3rem)',
                    fontWeight: '800', lineHeight: '1.15',
                    letterSpacing: '-0.04em', color: '#fff',
                    marginBottom: '18px',
                  }}
                >
                  {isRegister ? (
                    <>
                      Join the Ultimate{' '}
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '500' }}>Founder Hub</span>
                      <br />and Start Growing.
                    </>
                  ) : (
                    <>
                      Discover India's{' '}
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '500' }}>Startup Ecosystem</span>
                      <br />with Prograstic.
                    </>
                  )}
                </h1>

                <p style={{
                  fontSize: '14px', color: 'rgba(255,255,255,0.45)',
                  lineHeight: '1.65', marginBottom: '24px',
                  maxWidth: '38ch',
                }}>
                  {isRegister 
                    ? "Connect with operators, discover opportunities, and leverage India's leading community ecosystem built for startup builders."
                    : "Access premium community resources, exclusive services, and curated startup tools to accelerate your entrepreneurial journey."}
                </p>

                {/* Static Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'flex-start', marginBottom: '26px' }}>
                  {chips.map((chip) => (
                    <span key={chip} style={{
                      padding: '4px 12px', borderRadius: '20px',
                      fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '11px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                      color: 'rgba(255,255,255,0.65)',
                    }}>
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '28px', justifyContent: 'flex-start' }}>
                  {(isRegister
                    ? [{ value: '100%', label: 'Curated' }, { value: 'Free', label: 'Resources' }, { value: '24/7', label: 'Ecosystem' }]
                    : [{ value: '12K+', label: 'Founders' }, { value: '800+', label: 'Startups' }, { value: '50+', label: 'Partners' }]
                  ).map((stat) => (
                    <div key={stat.label}>
                      <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.04em', color: '#fff' }}>{stat.value}</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .auth-brand-panel { display: none !important; }
        }
      `}</style>
    </>
  );
}
