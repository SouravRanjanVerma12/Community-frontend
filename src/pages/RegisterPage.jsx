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
    <div style={{ display: 'flex', minHeight: '100svh', height: '100svh', background: 'var(--surface-0)' }}>
      {/* Left brand panel — hidden on mobile */}
      <div className="auth-brand-panel" style={{ flex: '0 0 52%', display: 'flex', overflow: 'hidden' }}>
        <AuthBrandPanel mode="register" />
      </div>

      {/* Right form panel */}
      <div
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
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginBottom: '10px',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            DevCommunity
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
              Create your account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Join DevCommunity — it only takes a minute
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
