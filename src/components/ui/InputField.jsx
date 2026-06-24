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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
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
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          background: focused ? 'var(--input-bg-focus)' : 'var(--input-bg)',
          border: `1.5px solid ${error ? 'var(--error-text)' : focused ? 'var(--accent)' : 'var(--input-border)'}`,
          transition: 'border-color 0.15s, background 0.15s',
          overflow: 'hidden',
        }}
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
          style={{
            flex: 1,
            minHeight: '44px',
            padding: '11px 14px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '16px',
            lineHeight: '1.5',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            aria-pressed={showPw}
            style={{
              width: '44px',
              height: '44px',
              padding: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: '8px',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
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
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--error-text)', margin: 0, lineHeight: '1.5' }}
          >
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
