import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              fontSize: '14px',
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
            style={{ fontSize: '13px', color: 'var(--text-muted)' }}
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
          fontSize: '13px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
        or continue with
        <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
      </div>

      {/* Social placeholders */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {['GitHub', 'Google'].map((provider) => (
          <button
            key={provider}
            type="button"
            disabled
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              background: '#f9fafb',
              border: '1.5px solid #e4e7ec',
              color: '#6b7280',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'not-allowed',
              opacity: 0.6,
            }}
          >
            {provider}
          </button>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
        New here?{' '}
        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '500' }}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
