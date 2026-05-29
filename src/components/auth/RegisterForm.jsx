import { useState, useEffect, useRef } from 'react';
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

  const statusColor = { available: '#16a34a', taken: '#dc2626', invalid: '#d97706', checking: '#9ca3af', idle: '#9ca3af' }[usernameStatus];
  // Allow submit when: no username entered (auto-generated), OR entered username is confirmed available
  const usernameOk = !username || usernameStatus === 'available';
  const canSubmit  = !isLoading && usernameOk && password === confirm && password.length >= 6;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* API error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -8, height: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '14px' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <InputField label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" required />
      <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />

      {/* Username field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>Username</label>
          <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '1px 7px', borderRadius: '10px' }}>optional</span>
        </div>

        {/* Input with @ prefix */}
        <motion.div
          animate={{ boxShadow: usernameStatus === 'available' ? '0 0 0 3px rgba(22,163,74,0.15)' : usernameStatus === 'taken' ? '0 0 0 3px rgba(220,38,38,0.15)' : '0 0 0 0px transparent' }}
          style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', background: '#f9fafb', border: `1.5px solid ${usernameStatus === 'available' ? '#16a34a' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#dc2626' : '#e4e7ec'}`, overflow: 'hidden', transition: 'border-color 0.15s' }}>
          <span style={{ padding: '0 0 0 14px', color: '#9ca3af', fontSize: '15px', userSelect: 'none', display: 'flex', alignItems: 'center' }}>
            <AtSign size={15} />
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="leave blank to auto-generate"
            autoComplete="username"
            maxLength={20}
            style={{ flex: 1, padding: '11px 10px', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', color: '#111827', fontFamily: 'ui-monospace, Consolas, monospace' }}
          />
          <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center' }}>
            {usernameStatus === 'checking' && <Loader2 size={15} color="#9ca3af" style={{ animation: 'spin 0.8s linear infinite' }} />}
            {usernameStatus === 'available' && <CheckCircle size={15} color="#16a34a" />}
            {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={15} color="#dc2626" />}
          </span>
        </motion.div>

        {/* Auto-generate hint when blank */}
        {!username && (
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
            We'll auto-generate one from your name if you skip this.
          </p>
        )}

        {/* Status message */}
        <AnimatePresence>
          {usernameMsg && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '12px', color: statusColor, margin: 0 }}>
              {usernameMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Suggestions:</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setUsername(s)}
                  style={{
                    padding: '4px 12px', borderRadius: '20px', border: '1.5px solid',
                    borderColor: username === s ? '#7c3aed' : '#e4e7ec',
                    background: username === s ? 'rgba(124,58,237,0.08)' : '#f9fafb',
                    color: username === s ? '#7c3aed' : '#4b5563',
                    fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                    fontFamily: 'ui-monospace, Consolas, monospace',
                    transition: 'all 0.12s',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              {[1, 2, 3].map((level) => (
                <motion.div key={level} animate={{ background: pwStrength >= level ? strengthColors[pwStrength] : '#e4e7ec' }} transition={{ duration: 0.25 }} style={{ height: '3px', flex: 1, borderRadius: '2px' }} />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: strengthColors[pwStrength], minWidth: '44px' }}>{strengthLabels[pwStrength]}</span>
          </div>
        )}
      </div>

      <InputField label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" error={confirmError} required />

      {confirm && password && confirm === password && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '13px', marginTop: '-10px' }}>
          <CheckCircle size={14} /> Passwords match
        </motion.div>
      )}

      <Button type="submit" fullWidth isLoading={isLoading} size="lg" disabled={!canSubmit} style={{ marginTop: '4px' }}>
        Create account
      </Button>

      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
        Already a member?{' '}
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: '500' }}>Sign in</Link>
      </p>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
        By creating an account you agree to our{' '}
        <a href="#" style={{ color: 'var(--text-secondary)' }}>Terms</a> and{' '}
        <a href="#" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
