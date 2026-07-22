import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Logo from '../components/ui/Logo';
import { SplineScene } from '../components/ui/spline';
import { Spotlight } from '../components/ui/spotlight';
import { Sparkles, Sun, Moon } from 'lucide-react';

const HUB_CHIPS = ['founders', 'builders', 'collab()', 'startupIndia', 'community'];

// Theme-aware override variables for the auth card inputs & elements
const cardThemeVars = {
  '--input-bg': 'var(--surface-1)',
  '--input-bg-focus': 'var(--card-bg)',
  '--input-border': 'var(--border)',
  '--border': 'var(--border)',
  '--text-primary': 'var(--text-primary)',
  '--text-secondary': 'var(--text-secondary)',
  '--text-muted': 'var(--text-muted)',
  '--hover-bg': 'var(--hover-bg)',
  '--surface-2': 'var(--surface-2)',
  '--accent': 'var(--accent)',
  '--accent-border': 'var(--accent-border)',
  '--accent-bg': 'var(--accent-bg)',
  '--error-text': '#ef4444',
  '--error-bg': 'rgba(239, 68, 68, 0.1)',
  '--error-border': 'rgba(239, 68, 68, 0.25)',
  '--mono': 'ui-monospace,Consolas,monospace',
};

const cardClasses = [
  'w-full max-w-[440px] bg-card border border-border rounded-[20px] sm:rounded-[24px]',
  'p-[32px_24px] sm:p-[42px_38px] backdrop-blur-2xl',
  'shadow-[0_24px_70px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.7)]',
  'max-h-[90svh] overflow-y-auto scrollbar-none',
  'pointer-events-auto',
].join(' ');

export default function AuthPage() {
  const { user, accessToken } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  useEffect(() => {
    if (user && accessToken) navigate('/explore', { replace: true });
  }, [user, accessToken, navigate]);

  const authThemeVars = {
    ...cardThemeVars,
    ...(theme === 'light' ? {
      '--card-bg': '#f8fafc',
      '--input-bg': '#ffffff',
      '--input-bg-focus': '#ffffff',
      '--input-border': '#e2e8f0',
      '--border': '#cbd5e1',
      '--surface-2': '#f1f5f9',
    } : {
      '--accent': '#818cf8',
      '--accent-border': 'rgba(129, 140, 248, 0.3)',
      '--accent-bg': 'rgba(129, 140, 248, 0.08)',
      '--btn-grad': 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      '--btn-grad-shadow': '0 4px 20px rgba(99, 102, 241, 0.35)',
      '--btn-grad-shadow-hover': '0 6px 28px rgba(99, 102, 241, 0.5)',
    })
  };

  return (
    <div className="relative min-h-svh bg-surface-0 text-text-primary transition-colors duration-200">
      {/* Background: 3D robot scene with clean gradient background in light mode */}
      <div className="fixed inset-0 z-0 overflow-hidden transition-colors duration-300" style={{ background: theme === 'dark' ? '#02030a' : 'linear-gradient(135deg, #f1f5f9 0%, #e0e7ff 100%)' }} aria-hidden>
        {theme === 'dark' && <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />}
        <div className="w-full h-full transition-all duration-300" style={{ filter: theme === 'light' ? 'invert(1)' : 'none' }}>
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Top Right Header Controls — Theme Toggle */}
      <div className="fixed top-5 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/80 border border-border backdrop-blur-md shadow-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer text-xs font-semibold"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-500" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Right-side brand copy */}
      <div className="hidden lg:block fixed top-28 right-12 z-10 w-[340px] text-right pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full py-1 px-3 mb-4 backdrop-blur-md">
            <Sparkles size={12} className="text-accent" />
            <span className="text-[11px] text-accent font-semibold tracking-wide">Prograstic Hub</span>
          </div>

          <h2 className="text-3xl font-extrabold leading-[1.2] tracking-[-0.03em] text-text-primary mb-3">
            Where builders find their{' '}
            <span className="text-accent font-medium">people.</span>
          </h2>

          <p className="text-[14px] text-text-muted leading-[1.6] mb-5">
            Prograstic Hub connects founders, developers, and operators to collaborate
            on real projects, share resources, and grow India's startup ecosystem together.
          </p>

          <div className="flex flex-wrap gap-1.5 justify-end">
            {HUB_CHIPS.map((chip) => (
              <span
                key={chip}
                className="px-3 py-1 rounded-full font-mono text-[11px] bg-surface-2 border border-border text-text-secondary"
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
            key={isRegister ? 'register-card' : 'login-card'}
            className={cardClasses}
            style={authThemeVars}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo */}
            <div className="mb-[28px]">
              <Logo size={34} showText={true} />
            </div>
            {isRegister ? (
              <>
                <div className="mb-6">
                  <h1 className="font-bold text-[26px] text-text-primary tracking-[-0.5px] mb-1">Create your account</h1>
                  <p className="text-sm text-text-muted leading-[1.6] m-0">Join Prograstic and start building</p>
                </div>
                <RegisterForm />
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="font-bold text-[26px] text-text-primary tracking-[-0.5px] mb-1">Welcome back</h1>
                  <p className="text-sm text-text-muted leading-[1.6] m-0">Sign in to continue to Prograstic</p>
                </div>
                <LoginForm />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

