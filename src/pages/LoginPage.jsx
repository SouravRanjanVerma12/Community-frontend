import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import LoginForm from '../components/auth/LoginForm';

const cardThemeVars = {
  '--input-bg': 'rgba(255, 255, 255, 0.05)',
  '--input-bg-focus': 'rgba(255, 255, 255, 0.08)',
  '--input-border': 'rgba(255, 255, 255, 0.10)',
  '--border': 'rgba(255, 255, 255, 0.10)',
  '--text-primary': '#ffffff',
  '--text-secondary': 'rgba(255, 255, 255, 0.70)',
  '--text-muted': 'rgba(255, 255, 255, 0.42)',
  '--hover-bg': 'rgba(255, 255, 255, 0.06)',
  '--surface-2': 'rgba(255, 255, 255, 0.06)',
  '--accent': '#e8eaf0',
  '--accent-border': 'rgba(232, 234, 240, 0.35)',
  '--error-text': '#ff6b6b',
  '--error-bg': 'rgba(255, 107, 107, 0.12)',
  '--error-border': 'rgba(255, 107, 107, 0.32)',
  '--btn-grad': 'linear-gradient(135deg, #2c2f3a 0%, #3a3d4a 100%)',
  '--btn-grad-shadow': '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
  '--btn-grad-shadow-hover': '0 6px 28px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.18) inset',
};

export default function LoginPage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem('auth_layout_mode') || 'split';
  });

  const toggleLayout = () => {
    const nextMode = layoutMode === 'split' ? 'focus' : 'split';
    setLayoutMode(nextMode);
    localStorage.setItem('auth_layout_mode', nextMode);
  };

  useEffect(() => {
    if (user && accessToken) navigate('/explore', { replace: true });
  }, [user, accessToken, navigate]);

  return (
    <>
      {/* Toggle Layout Button */}
      <button
        onClick={toggleLayout}
        className="hidden lg:flex fixed top-6 right-6 z-10 bg-white/4 border border-white/10 rounded-xl px-4 py-2 text-white font-[DM_Sans,system-ui,sans-serif] text-[12.5px] font-semibold cursor-pointer backdrop-blur-[10px] items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-white/9 hover:border-white/20"
      >
        <span className={`inline-flex text-sm transition-transform duration-400 ${layoutMode === 'focus' ? 'rotate-180' : ''}`}>
          ⇄
        </span>
        {layoutMode === 'split' ? 'Focus Mode' : 'Split View'}
      </button>

      <div className="relative min-h-svh flex items-stretch overflow-x-hidden lg:[&]:justify-start justify-center">
        <AuthBrandPanel mode="login" showCopy={layoutMode === 'split'} />

        {/* ── Sliding Form Column ── */}
        <div
          className={[
            'relative lg:absolute lg:top-0 lg:right-0 w-full lg:w-1/2 h-auto lg:h-full z-2',
            'flex items-center justify-center px-5 py-10 lg:px-10 lg:py-12 box-border',
            'transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]',
            layoutMode === 'focus' ? 'lg:-translate-x-full' : 'lg:translate-x-0',
          ].join(' ')}
        >
          <motion.div
            className="w-full max-w-[420px] bg-white/4 border border-white/10 rounded-[20px] p-9 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_32px_80px_rgba(0,0,0,0.6)] **:font-[DM_Sans,system-ui,sans-serif]"
            style={cardThemeVars}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-[30px]">
              <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-[radial-gradient(circle_at_35%_35%,#fff_0%,#a5b4fc_42%,#4338ca_100%)] shadow-[0_0_16px_rgba(165,180,252,0.45)]" />
              <span className="font-[Outfit,system-ui,sans-serif]! font-bold text-lg text-white tracking-[-0.3px]">Prograstic</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="font-[Outfit,system-ui,sans-serif]! font-bold text-[26px] text-white tracking-[-0.5px] mb-2">Welcome back</h1>
              <p className="text-sm text-white/45 leading-[1.6] m-0">Sign in to continue to Prograstic</p>
            </div>

            <LoginForm />
          </motion.div>
        </div>
      </div>
    </>
  );
}
