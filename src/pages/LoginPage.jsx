import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && accessToken) navigate('/explore', { replace: true });
  }, [user, accessToken, navigate]);

  return (
    <div className="auth-page" style={{ display: 'flex', minHeight: '100svh', height: '100svh', background: 'var(--surface-0)' }}>
      {/* Left brand panel — hidden on mobile */}
      <div className="auth-brand-panel" style={{ flex: '0 0 52%', display: 'flex', overflow: 'hidden' }}>
        <AuthBrandPanel mode="login" />
      </div>

      {/* Right form panel */}
      <div
        className="auth-form-panel"
        style={{
          flex: '1 1 48%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          background: 'var(--surface-1)',
          overflowY: 'auto',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Mobile logo */}
        <div
          className="auth-mobile-logo"
          style={{ display: 'none', marginBottom: '28px', textAlign: 'center' }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--btn-grad)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 4px 20px rgba(255,92,53,0.38)',
            }}
          >
            <Zap size={22} color="#fff" fill="#fff" aria-hidden />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Prograstic
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '390px' }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '6px',
                letterSpacing: '-0.5px',
              }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Sign in to continue to Prograstic
            </p>
          </div>

          <LoginForm />
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-page { height: auto !important; min-height: 100svh !important; }
          .auth-brand-panel { display: none !important; }
          .auth-mobile-logo { display: block !important; }
          .auth-form-panel {
            flex: 1 1 auto !important;
            border-left: none !important;
            padding: 32px 20px !important;
            min-height: 100svh;
          }
        }
        @media (max-width: 480px) {
          .auth-form-panel { padding: 28px 16px !important; }
        }
      `}</style>
    </div>
  );
}
