import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && accessToken) navigate('/explore', { replace: true });
  }, [user, accessToken, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100svh', background: 'var(--surface-0)' }}>
      {/* Left branding — hidden on mobile */}
      <div className="auth-brand-panel" style={{ flex: '0 0 55%', display: 'flex' }}>
        <AuthBrandPanel />
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: '1 1 45%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: '#ffffff',
          overflowY: 'auto',
          borderLeft: '1px solid var(--card-border)',
        }}
      >
        {/* Mobile logo */}
        <div className="auth-mobile-logo" style={{ display: 'none', marginBottom: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>⚡</span>
          <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            DevCommunity
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '6px',
                letterSpacing: '-0.5px',
              }}
            >
              Join the community
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
              Create your account and start sharing
            </p>
          </div>

          <RegisterForm />
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-brand-panel { display: none !important; }
          .auth-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
