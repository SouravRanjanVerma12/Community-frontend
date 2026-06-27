import { useState, useEffect, useRef, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, Loader2, AtSign } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import axios from 'axios';
import { API_URL } from '../../config';

const BASE = `${API_URL}/api`;

const authLinkClasses = 'cursor-pointer rounded-md outline-none transition-opacity duration-150 hover:opacity-85 focus-visible:shadow-[0_0_0_3px_var(--accent-border)]';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">

      {/* API error */}
      <AnimatePresence>
        {error && (
          <motion.div role="alert" initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] bg-error-bg border border-error-border text-error text-sm leading-normal">
            <AlertCircle size={15} className="shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <InputField label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" required />
      <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />

      {/* Username field */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor={usernameId} className="text-[13px] font-medium text-text-secondary">Username</label>
          <span className="text-[11px] text-text-muted bg-surface-2 px-[7px] py-px rounded-[10px]">optional</span>
        </div>

        {/* Input with @ prefix */}
        <motion.div
          animate={{ boxShadow: usernameStatus === 'available' ? '0 0 0 3px var(--success-border)' : usernameStatus === 'taken' ? '0 0 0 3px var(--error-border)' : '0 0 0 0px transparent' }}
          className={[
            'flex items-center rounded-[10px] bg-input border-[1.5px] overflow-hidden transition-colors duration-150',
            usernameStatus === 'available' ? 'border-success' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-error' : 'border-input-border',
          ].join(' ')}
        >
          <span className="pl-3.5 text-text-muted text-[15px] select-none flex items-center">
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
            className="flex-1 min-h-11 py-[11px] px-2.5 bg-transparent border-none outline-none text-base text-text-primary font-mono"
          />
          <span className="px-3 flex items-center">
            {usernameStatus === 'checking' && <Loader2 size={15} color="var(--text-muted)" className="animate-spin" />}
            {usernameStatus === 'available' && <CheckCircle size={15} color="var(--success-text)" />}
            {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={15} color="var(--error-text)" />}
          </span>
        </motion.div>

        {/* Auto-generate hint when blank */}
        {!username && (
          <p className="text-xs text-text-muted m-0 leading-normal">
            We'll auto-generate one from your name if you skip this.
          </p>
        )}

        {/* Status message */}
        <AnimatePresence>
          {usernameMsg && (
            <motion.p id={`${usernameId}-status`} role="status" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[13px] m-0 leading-normal" style={{ color: statusColor }}>
              {usernameMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-text-muted m-0">Suggestions:</p>
            <div className="flex gap-2 flex-wrap">
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setUsername(s)}
                  className={[
                    'min-h-9 px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium cursor-pointer font-mono',
                    'transition-[background-color,border-color,transform] duration-150',
                    username === s ? 'border-accent bg-accent-bg text-accent' : 'border-border bg-input text-text-secondary',
                  ].join(' ')}
                >
                  @{s}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" required />
        {password.length > 0 && (
          <div className="flex items-center gap-2" aria-live="polite">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3].map((level) => (
                <motion.div key={level} animate={{ background: pwStrength >= level ? strengthColors[pwStrength] : 'var(--border)' }} transition={{ duration: 0.25 }} className="h-[3px] flex-1 rounded-[2px]" />
              ))}
            </div>
            <span className="text-xs min-w-11" style={{ color: strengthColors[pwStrength] }}>{strengthLabels[pwStrength]}</span>
          </div>
        )}
      </div>

      <InputField label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" error={confirmError} required />

      {confirm && password && confirm === password && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status" className="flex items-center gap-1.5 text-success text-[13px] -mt-2.5 leading-normal">
          <CheckCircle size={14} /> Passwords match
        </motion.div>
      )}

      <Button type="submit" fullWidth isLoading={isLoading} size="lg" disabled={!canSubmit} style={{ marginTop: '4px' }}>
        Create account
      </Button>

      <p className="text-center text-sm text-text-muted m-0 leading-relaxed">
        Already a member?{' '}
        <Link to="/" className={`${authLinkClasses} text-accent font-medium`}>Sign in</Link>
      </p>

      <p className="text-center text-xs text-text-muted m-0 leading-relaxed max-w-[60ch] mx-auto">
        By creating an account you agree to our{' '}
        <a href="#" className={`${authLinkClasses} text-text-secondary`}>Terms</a> and{' '}
        <a href="#" className={`${authLinkClasses} text-text-secondary`}>Privacy Policy</a>.
      </p>
    </form>
  );
}
