import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Logo from '../components/ui/Logo';
import { Sun, Moon, ArrowLeft, ArrowRight, Sparkles, Code2, Rocket } from 'lucide-react';

const HUB_CHIPS = ['founders', 'builders', 'collab()', 'startupIndia'];

// Theme-aware override variables for the auth card inputs & elements
const cardThemeVars = {
  '--input-bg': 'var(--surface-1)',
  '--input-bg-focus': 'var(--card-bg)',
  '--input-border': 'var(--border)',
  '--error-text': '#ef4444',
  '--error-bg': 'rgba(239, 68, 68, 0.1)',
  '--error-border': 'rgba(239, 68, 68, 0.25)',
  '--mono': 'ui-monospace,Consolas,monospace',
};

/* CSS-only artwork for the left panel — replaces the heavy Spline 3D scene */
const artworkLayers = {
  background: [
    // aurora glows in brand blue
    'radial-gradient(ellipse 90% 55% at 75% 12%, rgba(30,157,241,0.5) 0%, transparent 60%)',
    'radial-gradient(ellipse 70% 45% at 15% 45%, rgba(77,181,245,0.32) 0%, transparent 60%)',
    'radial-gradient(ellipse 100% 60% at 60% 105%, rgba(28,110,240,0.45) 0%, transparent 65%)',
    // deep navy base
    'linear-gradient(165deg, #060d1f 0%, #081226 45%, #02060f 100%)',
  ].join(', '),
};

const starfield = {
  backgroundImage: [
    'radial-gradient(1.5px 1.5px at 18% 22%, rgba(255,255,255,0.9) 50%, transparent 51%)',
    'radial-gradient(1px 1px at 68% 12%, rgba(255,255,255,0.7) 50%, transparent 51%)',
    'radial-gradient(1.5px 1.5px at 84% 34%, rgba(255,255,255,0.8) 50%, transparent 51%)',
    'radial-gradient(1px 1px at 42% 8%, rgba(255,255,255,0.6) 50%, transparent 51%)',
    'radial-gradient(1px 1px at 8% 62%, rgba(255,255,255,0.5) 50%, transparent 51%)',
    'radial-gradient(1.5px 1.5px at 55% 42%, rgba(255,255,255,0.65) 50%, transparent 51%)',
    'radial-gradient(1px 1px at 30% 50%, rgba(255,255,255,0.45) 50%, transparent 51%)',
    'radial-gradient(1px 1px at 92% 58%, rgba(255,255,255,0.5) 50%, transparent 51%)',
  ].join(', '),
};

export default function AuthPage() {
  const { user, accessToken } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  useEffect(() => {
    if (user && accessToken) navigate('/explore', { replace: true });
  }, [user, accessToken, navigate]);

  const toggleRoute = () => navigate(isRegister ? '/' : '/register');

  return (
    <div className="relative min-h-svh bg-card text-text-primary transition-colors duration-200">
      {/* Full-screen split layout */}
      <div className="w-full min-h-svh grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* ── Left: artwork panel ── */}
        <div className="hidden lg:block p-3.5 pr-0">
          <div
            className="relative h-full min-h-[620px] rounded-[22px] overflow-hidden flex flex-col justify-between p-8"
            style={artworkLayers}
          >
            {/* starfield + grid overlays */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={starfield} />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none bg-[size:52px_52px]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
              }}
            />
            {/* ridge silhouette */}
            <svg
              aria-hidden
              className="absolute bottom-0 left-0 w-full h-[38%] pointer-events-none"
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
            >
              <path d="M0,220 L0,150 L90,90 L170,140 L260,60 L340,120 L430,45 L510,110 L600,70 L600,220 Z" fill="rgba(5,10,24,0.85)" />
              <path d="M0,220 L0,185 L120,130 L220,175 L330,110 L440,160 L540,120 L600,150 L600,220 Z" fill="rgba(10,20,44,0.9)" />
            </svg>

            {/* Top row: panel label + switch pill */}
            <div className="relative z-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                <span className="text-white font-bold text-[15px] tracking-tight">
                  {isRegister ? 'Join the Hub' : 'Live Builder Network'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!isRegister && (
                  <Link
                    to="/register"
                    className="text-white/70 hover:text-white text-[13px] font-semibold transition-colors"
                  >
                    Sign Up
                  </Link>
                )}
                <button
                  onClick={toggleRoute}
                  className="px-4.5 py-1.5 rounded-full bg-white text-[#0f1419] text-[13px] font-bold cursor-pointer hover:bg-white/90 transition-all shadow-md active:scale-95"
                >
                  {isRegister ? 'Sign In' : 'Join Us'}
                </button>
              </div>
            </div>

            {/* Middle: Brand Headline */}
            <div className="relative z-1 my-auto py-6">
              {/* Main Headline */}
              <div className="max-w-[44ch]">
                <div className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full py-1 px-3 mb-3.5 backdrop-blur-md">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span className="text-[11px] text-white/90 font-semibold tracking-wide">India's Builder Ecosystem</span>
                </div>
                <h2 className="text-white text-[clamp(1.75rem,2.4vw,2.4rem)] font-extrabold leading-[1.15] tracking-[-0.03em] mb-3">
                  Where builders find their{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent font-extrabold">
                    people.
                  </span>
                </h2>
                <p className="text-[14px] text-white/65 leading-[1.6] mb-5">
                  Your side project deserves a real team. Connect with devs, designers, and co-founders who actually ship.
                </p>

                {/* Tech & Role Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/8 border border-white/15 text-white/90 backdrop-blur-md transition-all hover:bg-white/12 hover:border-cyan-400/40">
                    <Code2 size={12} className="text-cyan-400" /> Developers
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/8 border border-white/15 text-white/90 backdrop-blur-md transition-all hover:bg-white/12 hover:border-sky-400/40">
                    <Rocket size={12} className="text-sky-400" /> Founders
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/8 border border-white/15 text-white/90 backdrop-blur-md transition-all hover:bg-white/12 hover:border-amber-400/40">
                    <Sparkles size={12} className="text-amber-400" /> Designers
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom row: brand credit + view switch arrows */}
            <div className="relative z-1 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
                  <Logo size={24} variant="dark" />
                </div>
                <div>
                  <div className="text-white font-bold text-[15px] leading-tight">Prograstic</div>
                  <div className="text-white/55 text-[12.5px]">India's builder ecosystem</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleRoute}
                  aria-label={isRegister ? 'Go to sign in' : 'Go to sign up'}
                  className="w-10 h-10 rounded-full border border-white/25 text-white/80 hover:text-white hover:border-white/50 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={toggleRoute}
                  aria-label={isRegister ? 'Go to sign in' : 'Go to sign up'}
                  className="w-10 h-10 rounded-full border border-white/25 text-white/80 hover:text-white hover:border-white/50 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="flex flex-col px-6 py-7 sm:px-10 sm:py-8 lg:px-12 max-h-svh overflow-y-auto scrollbar-none" style={cardThemeVars}>
          {/* Top row: brand + theme toggle */}
          <div className="flex items-center justify-between mb-8 w-full max-w-[420px] mx-auto">
            <Logo size={30} showText={true} />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-1 border border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer text-xs font-semibold"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-accent" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? 'register' : 'login'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto my-auto"
            >
              {/* Giant greeting */}
              <div className="text-center mb-7">
                <h1 className="font-extrabold text-[clamp(2rem,4.5vw,2.9rem)] text-text-primary tracking-[-0.04em] leading-[1.1] mb-2">
                  {isRegister ? 'Hi Builder' : 'Welcome back'}
                </h1>
                <p className="text-[15px] text-text-muted m-0">
                  {isRegister ? 'Create your Prograstic account' : 'Sign in to continue to Prograstic'}
                </p>
              </div>

              {isRegister ? <RegisterForm /> : <LoginForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
