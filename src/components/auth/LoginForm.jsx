import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

import { LinkedInIcon } from '../icons/LinkedInIcon';
import { GoogleIcon } from '../icons/GoogleIcon';

const linkedinBtnClasses = [
  'flex-1 min-w-[90px] min-h-11 px-3 py-2.5 rounded-[10px] bg-[#0A66C2] border border-[#0A66C2]',
  'text-white text-[13px] font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-65',
  'flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 hover:opacity-90',
  'focus-visible:shadow-[0_0_0_3px_var(--accent-border)] outline-none',
].join(' ');

const googleBtnClasses = [
  'flex-1 min-w-[90px] min-h-11 px-3 py-2.5 rounded-[10px] bg-white border border-[#dadce0]',
  'text-[#3c4043] text-[13px] font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-65',
  'flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 hover:opacity-90',
  'focus-visible:shadow-[0_0_0_3px_var(--accent-border)] outline-none',
].join(' ');

const authLinkClasses = 'cursor-pointer rounded-md outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:shadow-[0_0_0_3px_var(--accent-border)]';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithLinkedin, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = await login(email, password);
    if (ok) navigate('/explore');
  };

  const handleLinkedinLogin = async () => {
    clearError();
    const ok = await loginWithLinkedin();
    if (ok) navigate('/explore');
  };

  const handleGoogleLogin = async () => {
    clearError();
    const ok = await loginWithGoogle();
    if (ok) navigate('/explore');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            role="alert"
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] bg-error-bg border border-error-border text-error text-sm leading-normal"
          >
            <AlertCircle size={15} className="shrink-0" />
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

      <div className="flex flex-col gap-1.5">
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          required
        />
        <div className="text-right">
          <a
            href="#"
            className={`${authLinkClasses} inline-flex items-center min-h-11 text-[13px] text-accent opacity-85`}
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
      <div className="flex items-center gap-3 text-text-muted text-xs">
        <div className="flex-1 h-px bg-border" />
        or continue with
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Social buttons */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className={googleBtnClasses}>
          <GoogleIcon className="w-4 h-4" /> Continue with Google
        </button>
        <button type="button" onClick={handleLinkedinLogin} disabled={isLoading} className={linkedinBtnClasses}>
          <LinkedInIcon className="w-4 h-4" /> Continue with LinkedIn
        </button>
      </div>

      <p className="text-center text-sm text-text-muted m-0 leading-relaxed">
        New here?{' '}
        <Link to="/register" className={`${authLinkClasses} text-accent font-medium`}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
