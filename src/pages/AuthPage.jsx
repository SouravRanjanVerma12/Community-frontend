import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import LoginForm from '../components/auth/LoginForm';
import { SplineScene } from '../components/ui/spline';
import { Spotlight } from '../components/ui/spotlight';
import { Sparkles } from 'lucide-react';

const HUB_CHIPS = ['founders', 'builders', 'collab()', 'startupIndia', 'community'];

// Dark-glass theme override for the auth card — redefines the shared design
// tokens so child components (InputField, Button) pick up the auth look
// without any auth-specific styling of their own.
const cardThemeVars = {
  '--input-bg': 'rgba(0, 0, 0, 0.45)',
  '--input-bg-focus': 'rgba(0, 0, 0, 0.65)',
  '--input-border': '#000000',
  '--border': '#000000',
  '--text-primary': '#fff',
  '--text-secondary': 'rgba(255,255,255,0.75)',
  '--text-muted': 'rgba(255,255,255,0.45)',
  '--hover-bg': 'rgba(255,255,255,0.05)',
  '--surface-2': 'rgba(255,255,255,0.08)',
  '--accent': '#e8eaf0',
  '--accent-border': 'rgba(232,234,240,0.35)',
  '--accent-bg': 'rgba(232,234,240,0.10)',
  '--error-text': '#ff6b6b',
  '--error-bg': 'rgba(255,107,107,0.12)',
  '--error-border': 'rgba(255,107,107,0.32)',
  '--success-text': '#4ade80',
  '--success-bg': 'rgba(74,222,128,0.12)',
  '--success-border': 'rgba(74,222,128,0.32)',
  '--warning-text': '#fbbf24',
  '--btn-grad': 'linear-gradient(135deg, #2c2f3a 0%, #3a3d4a 100%)',
  '--btn-grad-shadow': '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset',
  '--btn-grad-shadow-hover': '0 6px 28px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.18) inset',
  '--mono': 'ui-monospace,Consolas,monospace',
};

const cardClasses = [
  'w-full max-w-[440px] bg-black/72 border border-black rounded-[16px] sm:rounded-[22px]',
  'p-[30px_20px] sm:p-[42px_38px] backdrop-blur-2xl',
  'shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_32px_80px_rgba(0,0,0,0.80)]',
  'max-h-[90svh] overflow-y-auto scrollbar-none',
  '**:font-[DM_Sans,system-ui,sans-serif]',
  'pointer-events-auto',
].join(' ');

export default function AuthPage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && accessToken) navigate('/explore', { replace: true });
  }, [user, accessToken, navigate]);

  return (
    <>
      {/* Background: interactive 3D scene */}
      <div className="fixed inset-0 z-0 bg-[#02030a] overflow-hidden" aria-hidden>
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Right-side brand copy — fills the empty space beside the robot */}
      <div className="hidden lg:block fixed top-28 right-10 z-10 w-[300px] text-right pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full py-1 px-3 mb-4 backdrop-blur-[10px]">
            <Sparkles size={10} className="text-white/70" />
            <span className="text-[11px] text-white/60 font-medium">Prograstic Hub</span>
          </div>

          <h2 className="font-[Outfit,system-ui,sans-serif]! text-2xl font-extrabold leading-[1.2] tracking-[-0.02em] text-white mb-3">
            Where builders find their{' '}
            <span className="text-white/35 font-medium">people.</span>
          </h2>

          <p className="text-[13px] text-white/45 leading-[1.6] mb-4">
            Prograstic Hub connects founders, developers, and operators to collaborate
            on real projects, share resources, and grow India's startup ecosystem together.
          </p>

          <div className="flex flex-wrap gap-1.5 justify-end">
            {HUB_CHIPS.map((chip) => (
              <span
                key={chip}
                className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-white/4 border border-white/9 text-white/55"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Centered form */}
      <div className="relative z-1 min-h-svh flex items-center justify-start px-5 pt-14 pb-10 pl-[min(80px,6vw)] pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key="login-card"
            className={cardClasses}
            style={cardThemeVars}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-[30px]">
              <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-[radial-gradient(circle_at_35%_35%,#fff_0%,#a5b4fc_42%,#4338ca_100%)] shadow-[0_0_16px_rgba(165,180,252,0.45)]" />
              <span className="font-[Outfit,system-ui,sans-serif]! font-bold text-lg text-white tracking-[-0.3px]">Prograstic</span>
            </div>
            <div className="mb-7">
              <h1 className="font-[Outfit,system-ui,sans-serif]! font-bold text-[26px] text-white tracking-[-0.5px] mb-2">Welcome back</h1>
              <p className="text-sm text-white/45 leading-[1.6] m-0">Sign in to continue to Prograstic</p>
            </div>
            <LoginForm />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

