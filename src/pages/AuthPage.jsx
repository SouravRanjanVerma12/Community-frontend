import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import bgPanel from '../assets/auth-hero/bg-panel.png';

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        * { box-sizing: border-box; }

        /* ── Full-viewport background ── */
        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: #02030a;
          overflow: hidden;
        }
        .auth-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        /* subtle dark vignette so the card reads cleanly */
        

        /* ── Page shell ── */
        .auth-root {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          z-index: 1;
          padding: 56px 20px 40px;
          padding-left: min(80px, 6vw);
        }

        /* ── Top-right pill toggle ── */
        .auth-tab-pill {
          position: fixed;
          top: 24px;
          right: 28px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid #000000;
          border-radius: 14px;
          padding: 5px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.40);
        }

        .auth-tab-btn {
          position: relative;
          padding: 7px 22px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
          z-index: 1;
          white-space: nowrap;
        }
        .auth-tab-btn.active { color: #fff; }

        .auth-tab-indicator {
          position: absolute;
          top: 5px;
          border-radius: 10px;
          height: calc(100% - 10px);
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          transition:
            left 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        /* ── Glass card ── */
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: rgba(0, 0, 0, 0.72);
          border: 1px solid #000000;
          border-radius: 22px;
          padding: 42px 38px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 32px 80px rgba(0,0,0,0.80);
          max-height: 90svh;
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */

          --input-bg: rgba(0, 0, 0, 0.45);
          --input-bg-focus: rgba(0, 0, 0, 0.65);
          --input-border: #000000;
          --border: #000000;
          --text-primary: #fff;
          --text-secondary: rgba(255,255,255,0.75);
          --text-muted: rgba(255,255,255,0.45);
          --hover-bg: rgba(255,255,255,0.05);
          --surface-2: rgba(255,255,255,0.08);
          --accent: #e8eaf0;
          --accent-border: rgba(232,234,240,0.35);
          --accent-bg: rgba(232,234,240,0.10);
          --error-text: #ff6b6b;
          --error-bg: rgba(255,107,107,0.12);
          --error-border: rgba(255,107,107,0.32);
          --success-text: #4ade80;
          --success-bg: rgba(74,222,128,0.12);
          --success-border: rgba(74,222,128,0.32);
          --warning-text: #fbbf24;
          --btn-grad: linear-gradient(135deg, #2c2f3a 0%, #3a3d4a 100%);
          --btn-grad-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset;
          --btn-grad-shadow-hover: 0 6px 28px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.18) inset;
          --mono: ui-monospace,Consolas,monospace;
        }

        .auth-card * { font-family: 'DM Sans', system-ui, sans-serif; }
        .auth-card::-webkit-scrollbar { display: none; }

        .auth-logo-text {
          font-family: 'Outfit', system-ui, sans-serif;
          font-weight: 700; font-size: 18px;
          color: #fff; letter-spacing: -0.3px;
        }
        .auth-heading {
          font-family: 'Outfit', system-ui, sans-serif;
          font-weight: 700; font-size: 26px;
          color: #fff; letter-spacing: -0.5px;
          margin: 0 0 8px 0;
        }
        .auth-display-font { font-family: 'Outfit', system-ui, sans-serif; }
        .auth-sub {
          font-size: 14px; color: rgba(255,255,255,0.45);
          line-height: 1.6; margin: 0;
        }

        @media (max-width: 480px) {
          .auth-card { padding: 30px 20px !important; border-radius: 16px; }
          .auth-tab-pill { right: 16px; top: 16px; }
          .auth-tab-btn { padding: 6px 14px; font-size: 12px; }
        }
      `}</style>

      {/* Background image */}
      <div className="auth-bg" aria-hidden>
        <img src={bgPanel} alt="" />
      </div>

      {/* Login / Sign Up pill */}
      <AuthTabPill tab={tab} switchTab={switchTab} />

      {/* Centered form */}
      <div className="auth-root">
        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.div
              key="login-card"
              className="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: 'radial-gradient(circle at 35% 35%, #fff 0%, #a5b4fc 42%, #4338ca 100%)',
                  boxShadow: '0 0 16px rgba(165,180,252,0.45)',
                }} />
                <span className="auth-logo-text">Prograstic</span>
              </div>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="auth-heading">Welcome back</h1>
                <p className="auth-sub">Sign in to continue to Prograstic</p>
              </div>
              <LoginForm />
            </motion.div>
          ) : (
            <motion.div
              key="signup-card"
              className="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '26px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: 'radial-gradient(circle at 35% 35%, #fff 0%, #a5b4fc 42%, #4338ca 100%)',
                  boxShadow: '0 0 16px rgba(165,180,252,0.45)',
                }} />
                <span className="auth-logo-text">Prograstic</span>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <h1 className="auth-heading">Create your account</h1>
                <p className="auth-sub">Join Prograstic — it only takes a minute</p>
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
    <div className="auth-tab-pill">
      <div
        className="auth-tab-indicator"
        style={{
          left: tab === 'login' ? '5px' : 'calc(50%)',
          width: 'calc(50% - 5px)',
        }}
      />
      {[{ id: 'login', label: 'Login' }, { id: 'signup', label: 'Sign Up' }].map((t) => (
        <button
          key={t.id}
          id={`auth-tab-${t.id}`}
          className={`auth-tab-btn${tab === t.id ? ' active' : ''}`}
          onClick={() => switchTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
