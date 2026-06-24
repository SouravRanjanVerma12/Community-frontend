import { useState } from 'react';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  style,
  fullWidth,
}) {
  const isDisabled = disabled || isLoading;
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '44px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    opacity: isDisabled ? 0.55 : 1,
    width: fullWidth ? '100%' : undefined,
    transition: 'background 0.15s, box-shadow 0.2s',
  };

  const sizes = {
    sm: { padding: '7px 14px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '10px 20px', fontSize: '14px', minHeight: '40px' },
    lg: { padding: '13px 24px', fontSize: '15px', minHeight: '48px' },
  };

  const variants = {
    primary: {
      background: 'var(--btn-grad)',
      color: '#ffffff',
      boxShadow: 'var(--btn-grad-shadow)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--accent)',
      border: '1.5px solid var(--border)',
    },
    danger: {
      background: 'var(--error-bg)',
      color: 'var(--error-text)',
      border: '1.5px solid var(--error-border)',
    },
  };

  const focusRing = isFocusVisible ? ', 0 0 0 3px var(--accent-border)' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onFocus={() => setIsFocusVisible(true)}
      onBlur={() => setIsFocusVisible(false)}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={
        isDisabled
          ? {}
          : variant === 'primary'
          ? { boxShadow: 'var(--btn-grad-shadow-hover)', transform: 'translateY(-1px)' }
          : { background: 'var(--accent-dim)', borderColor: 'var(--accent-border)' }
      }
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        ...style,
        boxShadow: `${(style?.boxShadow ?? variants[variant].boxShadow ?? 'none')}${focusRing}`,
      }}
    >
      {isLoading && <Spinner size="sm" color={variant === 'primary' ? '#fff' : 'var(--accent)'} />}
      {children}
    </motion.button>
  );
}
