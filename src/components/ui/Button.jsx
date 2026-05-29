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

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
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
    sm: { padding: '7px 14px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '13px 24px', fontSize: '15px' },
  };

  const variants = {
    primary: {
      background: '#7c3aed',
      color: '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    },
    ghost: {
      background: 'transparent',
      color: '#7c3aed',
      border: '1.5px solid #e4e7ec',
    },
    danger: {
      background: 'rgba(239,68,68,0.08)',
      color: '#dc2626',
      border: '1.5px solid rgba(239,68,68,0.2)',
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={
        isDisabled
          ? {}
          : variant === 'primary'
          ? { boxShadow: '0 4px 16px rgba(124,58,237,0.30)' }
          : { background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.3)' }
      }
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {isLoading && <Spinner size="sm" color={variant === 'primary' ? '#fff' : '#7c3aed'} />}
      {children}
    </motion.button>
  );
}
