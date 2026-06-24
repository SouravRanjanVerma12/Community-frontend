import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const socialBtnStyle = {
  flex: 1,
  minHeight: '44px',
  padding: '10px 14px',
  borderRadius: '10px',
  background: 'var(--input-bg)',
  border: '1.5px solid var(--input-border)',
  color: 'var(--text-secondary)',
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'not-allowed',
  opacity: 0.65,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'opacity 150ms, transform 150ms',
};

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = await login(email, password);
    if (ok) navigate('/explore');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              color: 'var(--error-text)',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          required
        />
        <div style={{ textAlign: 'right' }}>
          <a
            href="#"
            className="auth-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '44px',
              fontSize: '13px',
              color: 'var(--accent)',
              opacity: 0.85,
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'opacity 150ms',
            }}
            onClick={(e) => e.preventDefault()}
          >
            Forgot password?
          </a>
        </div>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} size="lg">
        Sign in
      </Button>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
          fontSize: '12px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        or continue with
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Social buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" disabled aria-disabled="true" title="Coming soon" style={socialBtnStyle}>
          <GithubIcon /> GitHub
        </button>
        <button type="button" disabled aria-disabled="true" title="Coming soon" style={socialBtnStyle}>
          <GoogleIcon /> Google
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
        New here?{' '}
        <Link to="/register" className="auth-link" style={{ color: 'var(--accent)', fontWeight: '500' }}>
          Create an account
        </Link>
      </p>

      <style>{`
        .auth-link { cursor: pointer; border-radius: 6px; outline: none; }
        .auth-link:hover { opacity: 0.8; }
        .auth-link:focus-visible { box-shadow: 0 0 0 3px var(--accent-border); }
        button:focus-visible { box-shadow: 0 0 0 3px var(--accent-border); }
      `}</style>
    </form>
  );
}
