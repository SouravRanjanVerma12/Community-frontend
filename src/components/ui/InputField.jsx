import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type;
  const reactId = useId();
  const inputId = `field-${reactId}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-text-secondary tracking-[0.01em]">
          {label}
        </label>
      )}

      <motion.div
        animate={{
          boxShadow: error
            ? '0 0 0 2px var(--error-border)'
            : focused
            ? '0 0 0 3px var(--accent-border)'
            : '0 0 0 1px var(--border)',
        }}
        transition={{ duration: 0.15 }}
        className={[
          'flex items-center rounded-[10px] overflow-hidden border-[1.5px]',
          'transition-[border-color,background-color] duration-150',
          focused ? 'bg-input-focus' : 'bg-input',
          error ? 'border-error' : focused ? 'border-accent' : 'border-input-border',
        ].join(' ')}
      >
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 min-h-11 px-3.5 py-[11px] bg-transparent border-none outline-none text-text-primary text-base leading-normal"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            aria-pressed={showPw}
            className={[
              'w-11 h-11 p-0 bg-none border-none cursor-pointer shrink-0 rounded-lg',
              'flex items-center justify-center text-text-muted',
              'transition-colors duration-150 hover:text-text-primary hover:bg-surface-2',
            ].join(' ')}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-[5px] text-[13px] text-error m-0 leading-normal"
          >
            <AlertCircle size={13} className="shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
