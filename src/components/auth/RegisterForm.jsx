import { useState, useEffect, useRef, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, Loader2, AtSign } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import axios from 'axios';

const BASE = 'http://localhost:3000/api';

/* generate 3 unique username suggestions from a name */
function generateSuggestions(name) {
  if (!name.trim()) return [];
  const base = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  if (!base) return [];
  const suffix = () => Math.floor(Math.random() * 900 + 100);
  const candidates = [
    base,
    `${base}_dev`,
    `${base}${suffix()}`,
    `dev_${base}`,
    `${base}.code`.replace('.', '_'),
    `the_${base}`,
  ];
  // deduplicate and return first 3
  return [...new Set(candidates)].slice(0, 3);
}

/* debounce hook */
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function RegisterForm() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [username, setUsername]   = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [suggestions, setSuggestions]   = useState([]);
  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle | checking | available | taken | invalid
  const [usernameMsg, setUsernameMsg]     = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const debouncedUsername = useDebounce(username, 450);
  const usernameId = useId();

  /* generate suggestions when name changes */
  useEffect(() => {
    setSuggestions(generateSuggestions(name));
  }, [name]);

  /* live username availability check */
  useEffect(() => {
    if (!debouncedUsername) { setUsernameStatus('idle'); setUsernameMsg(''); return; }
    const invalid = /[^a-z0-9_]/.test(debouncedUsername) || debouncedUsername.length < 3 || debouncedUsername.length > 20;
    if (invalid) {
      setUsernameStatus('invalid');
      setUsernameMsg('3–20 chars, lowercase letters, numbers and _ only');
      return;
    }
    setUsernameStatus('checking');
    axios.get(`${BASE}/auth/check-username`, { params: { username: debouncedUsername } })
      .then(({ data }) => {
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMsg('@' + debouncedUsername + ' is available');
        } else {
          setUsernameStatus('taken');
          setUsernameMsg(data.reason ?? 'Username already taken');
        }
      })
      .catch(() => { setUsernameStatus('idle'); setUsernameMsg(''); });
  }, [debouncedUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setConfirmError('');
    if (password !== confirm)     { setConfirmError('Passwords do not match.'); return; }
    if (password.length < 6)      { setConfirmError('Password must be at least 6 characters.'); return; }
    if (usernameStatus !== 'available') return;
    const ok = await register(name, email, password, username);
    if (ok) navigate('/explore');
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#f87171', '#f59e0b', '#34d399'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  const statusColor = { available: 'var(--success-text)', taken: 'var(--error-text)', invalid: 'var(--warning-text)', checking: 'var(--text-muted)', idle: 'var(--text-muted)' }[usernameStatus];
  // Allow submit when: no username entered (auto-generated), OR entered username is confirmed available
  const usernameOk = !username || usernameStatus === 'available';
  const canSubmit  = !isLoading && usernameOk && password === confirm && password.length >= 6;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* API error */}
      <AnimatePresence>
        {error && (
          <motion.div role="alert" initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -8, height: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)', fontSize: '14px', lineHeight: '1.5' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <InputField label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" required />
      <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />

      {/* Username field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor={usernameId} style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Username</label>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '1px 7px', borderRadius: '10px' }}>optional</span>
        </div>

        {/* Input with @ prefix */}
        <motion.div
          animate={{ boxShadow: usernameStatus === 'available' ? '0 0 0 3px var(--success-border)' : usernameStatus === 'taken' ? '0 0 0 3px var(--error-border)' : '0 0 0 0px transparent' }}
          style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', background: 'var(--input-bg)', border: `1.5px solid ${usernameStatus === 'available' ? 'var(--success-text)' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'var(--error-text)' : 'var(--input-border)'}`, overflow: 'hidden', transition: 'border-color 150ms' }}>
          <span style={{ padding: '0 0 0 14px', color: 'var(--text-muted)', fontSize: '15px', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
            <AtSign size={15} />
          </span>
          <input
            id={usernameId}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="leave blank to auto-generate"
            autoComplete="username"
            maxLength={20}
            aria-describedby={usernameMsg ? `${usernameId}-status` : undefined}
            style={{ flex: 1, minHeight: '44px', padding: '11px 10px', background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--mono)' }}
          />
          <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center' }}>
            {usernameStatus === 'checking' && <Loader2 size={15} color="var(--text-muted)" style={{ animation: 'spin 0.8s linear infinite' }} />}
            {usernameStatus === 'available' && <CheckCircle size={15} color="var(--success-text)" />}
            {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={15} color="var(--error-text)" />}
          </span>
        </motion.div>

        {/* Auto-generate hint when blank */}
        {!username && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            We'll auto-generate one from your name if you skip this.
          </p>
        )}

        {/* Status message */}
        <AnimatePresence>
          {usernameMsg && (
            <motion.p id={`${usernameId}-status`} role="status" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '13px', color: statusColor, margin: 0, lineHeight: '1.5' }}>
              {usernameMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Suggestions:</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  className="auth-link"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setUsername(s)}
                  style={{
                    minHeight: '36px', padding: '6px 14px', borderRadius: '20px', border: '1.5px solid',
                    borderColor: username === s ? 'var(--accent)' : 'var(--border)',
                    background: username === s ? 'var(--accent-bg)' : 'var(--input-bg)',
                    color: username === s ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                    fontFamily: 'var(--mono)',
                    transition: 'background 150ms, border-color 150ms, transform 150ms',
                  }}
                >
                  @{s}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" required />
        {password.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} aria-live="polite">
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              {[1, 2, 3].map((level) => (
                <motion.div key={level} animate={{ background: pwStrength >= level ? strengthColors[pwStrength] : 'var(--border)' }} transition={{ duration: 0.25 }} style={{ height: '3px', flex: 1, borderRadius: '2px' }} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: strengthColors[pwStrength], minWidth: '44px' }}>{strengthLabels[pwStrength]}</span>
          </div>
        )}
      </div>

      <InputField label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" error={confirmError} required />

      {confirm && password && confirm === password && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-text)', fontSize: '13px', marginTop: '-10px', lineHeight: '1.5' }}>
          <CheckCircle size={14} /> Passwords match
        </motion.div>
      )}

      <Button type="submit" fullWidth isLoading={isLoading} size="lg" disabled={!canSubmit} style={{ marginTop: '4px' }}>
        Create account
      </Button>

      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
        Already a member?{' '}
        <Link to="/" className="auth-link" style={{ color: 'var(--accent)', fontWeight: '500' }}>Sign in</Link>
      </p>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6', maxWidth: '60ch', marginInline: 'auto' }}>
        By creating an account you agree to our{' '}
        <a href="#" className="auth-link" style={{ color: 'var(--text-secondary)' }}>Terms</a> and{' '}
        <a href="#" className="auth-link" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-link { cursor: pointer; border-radius: 6px; outline: none; }
        .auth-link:hover { opacity: 0.85; }
        .auth-link:focus-visible { box-shadow: 0 0 0 3px var(--accent-border); }
      `}</style>
    </form>
  );
}
