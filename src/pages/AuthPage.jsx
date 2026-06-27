import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import bgPanel from '../assets/auth-hero/bg-panel.png';

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
].join(' ');

export default function AuthPage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState(location.pathname === '/register' ? 'signup' : 'login');

  const switchTab = (next) => {
    setTab(next);
    navigate(next === 'signup' ? '/register' : '/', { replace: true });
  };

  useEffect(() => {
    if (user && accessToken) navigate('/explore', { replace: true });
  }, [user, accessToken, navigate]);

  useEffect(() => {
    setTab(location.pathname === '/register' ? 'signup' : 'login');
  }, [location.pathname]);

  return (
    <>
      {/* Background image */}
      <div className="fixed inset-0 z-0 bg-[#02030a] overflow-hidden" aria-hidden>
        <img src={bgPanel} alt="" className="w-full h-full object-cover object-center" />
      </div>

      {/* Login / Sign Up pill */}
      <AuthTabPill tab={tab} switchTab={switchTab} />

      {/* Centered form */}
      <div className="relative z-1 min-h-svh flex items-center justify-start px-5 pt-14 pb-10 pl-[min(80px,6vw)]">
        <AnimatePresence mode="wait">
          {tab === 'login' ? (
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
          ) : (
            <motion.div
              key="signup-card"
              className={cardClasses}
              style={cardThemeVars}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-[26px]">
                <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-[radial-gradient(circle_at_35%_35%,#fff_0%,#a5b4fc_42%,#4338ca_100%)] shadow-[0_0_16px_rgba(165,180,252,0.45)]" />
                <span className="font-[Outfit,system-ui,sans-serif]! font-bold text-lg text-white tracking-[-0.3px]">Prograstic</span>
              </div>
              <div className="mb-6">
                <h1 className="font-[Outfit,system-ui,sans-serif]! font-bold text-[26px] text-white tracking-[-0.5px] mb-2">Create your account</h1>
                <p className="text-sm text-white/45 leading-[1.6] m-0">Join Prograstic — it only takes a minute</p>
              </div>
              <RegisterForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Pill toggle ── */
function AuthTabPill({ tab, switchTab }) {
  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-7 z-20 flex items-center gap-1 bg-black/65 border border-black rounded-[14px] p-[5px] backdrop-blur-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.40)]">
      <div
        className="absolute top-[5px] rounded-[10px] h-[calc(100%-10px)] bg-white/10 border border-white/14 transition-[left,width] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
        style={{
          left: tab === 'login' ? '5px' : 'calc(50%)',
          width: 'calc(50% - 5px)',
        }}
      />
      {[{ id: 'login', label: 'Login' }, { id: 'signup', label: 'Sign Up' }].map((t) => (
        <button
          key={t.id}
          id={`auth-tab-${t.id}`}
          onClick={() => switchTab(t.id)}
          className={[
            'relative z-1 px-3.5 sm:px-[22px] py-1.5 sm:py-[7px] border-none rounded-[10px] bg-transparent',
            'font-[DM_Sans,system-ui,sans-serif] text-xs sm:text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200',
            tab === t.id ? 'text-white' : 'text-white/45',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
