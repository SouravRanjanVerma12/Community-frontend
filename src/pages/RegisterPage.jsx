import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        .auth-root {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: stretch;
          overflow-x: hidden;
        }

        /* Form side column positioned absolutely on right to allow translation sliding */
        .auth-form-side {
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          box-sizing: border-box;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Transition layout by sliding form side column leftward */
        .mode-split .auth-form-side {
          transform: translateX(0);
        }

        .mode-focus .auth-form-side {
          transform: translateX(-100%); /* Moves column to the left half */
        }

        .auth-card {
          width: 100%;
          max-width: 430px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 20px;
          padding: 36px 36px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 32px 80px rgba(0,0,0,0.6);
          max-height: 90svh;
          overflow-y: auto;

          --input-bg: rgba(255, 255, 255, 0.05);
          --input-bg-focus: rgba(255, 255, 255, 0.08);
          --input-border: rgba(255, 255, 255, 0.10);
          --border: rgba(255, 255, 255, 0.10);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.70);
          --text-muted: rgba(255, 255, 255, 0.42);
          --hover-bg: rgba(255, 255, 255, 0.06);
          --surface-2: rgba(255, 255, 255, 0.06);
          --accent: #e8eaf0;
          --accent-border: rgba(232, 234, 240, 0.35);
          --accent-bg: rgba(232, 234, 240, 0.10);
          --error-text: #ff6b6b;
          --error-bg: rgba(255, 107, 107, 0.12);
          --error-border: rgba(255, 107, 107, 0.32);
          --success-text: #4ade80;
          --success-bg: rgba(74, 222, 128, 0.12);
          --success-border: rgba(74, 222, 128, 0.32);
          --warning-text: #fbbf24;
          --btn-grad: linear-gradient(135deg, #2c2f3a 0%, #3a3d4a 100%);
          --btn-grad-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
          --btn-grad-shadow-hover: 0 6px 28px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.18) inset;
          --mono: ui-monospace, Consolas, monospace;
        }

        .auth-card * {
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .auth-card::-webkit-scrollbar { width: 4px; }
        .auth-card::-webkit-scrollbar-track { background: transparent; }
        .auth-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 8px; }

        .auth-logo-text {
          font-family: 'Outfit', system-ui, sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .auth-heading {
          font-family: 'Outfit', system-ui, sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0 0 8px 0;
        }

        .auth-display-font {
          font-family: 'Outfit', system-ui, sans-serif;
        }

        .auth-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          margin: 0;
        }

        .auth-layout-toggle:hover {
          background: rgba(255, 255, 255, 0.09) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }

        /* Responsive styling */
        @media (max-width: 1024px) {
          .auth-root {
            justify-content: center;
          }
          .auth-form-side {
            position: relative;
            width: 100%;
            height: auto;
            transform: none !important;
            padding: 40px 20px;
          }
          .auth-layout-toggle {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .auth-card { padding: 28px 18px !important; }
        }
      `}</style>

      {/* Toggle Layout Button */}
      <button
        onClick={toggleLayout}
        className="auth-layout-toggle"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '8px 16px',
          color: '#fff',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '12.5px',
          fontWeight: '600',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ 
          display: 'inline-flex', 
          transform: layoutMode === 'focus' ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.4s ease',
          fontSize: '14px'
        }}>
          ⇄
        </span>
        {layoutMode === 'split' ? 'Focus Mode' : 'Split View'}
      </button>

      <div className={`auth-root mode-${layoutMode}`}>
        <AuthBrandPanel mode="register" showCopy={layoutMode === 'split'} />

        {/* ── Sliding Form Column ── */}
        <div className="auth-form-side">
          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

            {/* Heading */}
            <div style={{ marginBottom: '24px' }}>
              <h1 className="auth-heading">Create your account</h1>
              <p className="auth-sub">Join Prograstic — it only takes a minute</p>
            </div>

            <RegisterForm />
          </motion.div>
        </div>
      </div>
    </>
  );
}
