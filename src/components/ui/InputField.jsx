import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}

      <motion.div
        animate={{
          boxShadow: error
            ? '0 0 0 2px rgba(239,68,68,0.40)'
            : focused
            ? '0 0 0 3px rgba(124,58,237,0.18)'
            : '0 0 0 1px #e4e7ec',
        }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px',
          background: focused ? '#ffffff' : '#f9fafb',
          border: `1.5px solid ${error ? 'rgba(239,68,68,0.5)' : focused ? 'rgba(124,58,237,0.4)' : '#e4e7ec'}`,
          transition: 'border-color 0.15s, background 0.15s',
          overflow: 'hidden',
        }}
      >
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            padding: '11px 14px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#111827',
            fontSize: '15px',
            lineHeight: '1.4',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              padding: '0 14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
