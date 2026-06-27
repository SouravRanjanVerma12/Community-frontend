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
      <div aria-hidden className="fixed inset-0 z-0 bg-[#02030a] overflow-hidden pointer-events-none">
        <img src={bgPanel} alt="" className="w-full h-full object-cover object-center" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 bg-[size:52px_52px]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 85%, transparent 100%)',
          }}
        />
      </div>

      {/* ── Left brand copy container ── */}
      <div
        aria-hidden
        className="hidden lg:block fixed top-0 left-0 w-1/2 h-full z-1 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-1/2 -translate-y-1/2 left-[min(132px,9vw)] w-[min(580px,45vw)] z-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            {/* "NEW" badge */}
            <div className="inline-flex items-center gap-2 bg-white/4 border border-white/10 rounded-full py-[5px] pr-3.5 pl-1.5 mb-5 backdrop-blur-[10px]">
              <span className="inline-flex items-center gap-1 bg-white text-[#02030a] text-[9px] font-extrabold tracking-[0.06em] rounded-xl px-[9px] py-[3px]">
                <Sparkles size={9} fill="currentColor" /> NEW
              </span>
              <span className="text-[11.5px] text-white/70 font-medium">
                {isRegister ? 'Now open to every builder' : 'Latest ecosystem resources added'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-[Outfit,system-ui,sans-serif]! text-[clamp(2rem,2.8vw,3rem)] font-extrabold leading-[1.15] tracking-[-0.04em] text-white mb-[18px]">
              {isRegister ? (
                <>
                  Join the Ultimate{' '}
                  <span className="text-white/35 font-medium">Founder Hub</span>
                  <br />and Start Growing.
                </>
              ) : (
                <>
                  Discover India's{' '}
                  <span className="text-white/35 font-medium">Startup Ecosystem</span>
                  <br />with Prograstic.
                </>
              )}
            </h1>

            <p className="text-sm text-white/45 leading-[1.65] mb-6 max-w-[38ch]">
              {isRegister
                ? "Connect with operators, discover opportunities, and leverage India's leading community ecosystem built for startup builders."
                : "Access premium community resources, exclusive services, and curated startup tools to accelerate your entrepreneurial journey."}
            </p>

            {/* Static Chips */}
            <div className="flex flex-wrap gap-[7px] justify-start mb-[26px]">
              {chips.map((chip) => (
                <span key={chip} className="px-3 py-1 rounded-full font-mono text-[11px] bg-white/4 border border-white/9 text-white/65">
                  {chip}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex gap-7 justify-start">
              {(isRegister
                ? [{ value: '100%', label: 'Curated' }, { value: 'Free', label: 'Resources' }, { value: '24/7', label: 'Ecosystem' }]
                : [{ value: '12K+', label: 'Founders' }, { value: '800+', label: 'Startups' }, { value: '50+', label: 'Partners' }]
              ).map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-extrabold tracking-[-0.04em] text-white">{stat.value}</div>
                  <div className="text-[9px] text-white/38 uppercase tracking-[0.08em] mt-[3px]">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
