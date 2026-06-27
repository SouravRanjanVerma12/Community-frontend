import { useState } from 'react';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

const sizeClasses = {
  sm: 'px-3.5 py-[7px] text-[13px] min-h-9',
  md: 'px-5 py-2.5 text-sm min-h-10',
  lg: 'px-6 py-[13px] text-[15px] min-h-12',
};

const variantClasses = {
  primary: 'bg-(image:--btn-grad) text-white',
  ghost: 'bg-transparent text-accent border-[1.5px] border-border',
  danger: 'bg-error-bg text-error border-[1.5px] border-error-border',
};

const variantShadow = {
  primary: 'var(--btn-grad-shadow)',
  ghost: 'none',
  danger: 'none',
};

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

  const focusRing = isFocusVisible ? ', 0 0 0 3px var(--accent-border)' : '';
  const boxShadow = `${style?.boxShadow ?? variantShadow[variant]}${focusRing}`;

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
      className={[
        'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold',
        'border-none outline-none select-none whitespace-nowrap',
        'transition-[background,box-shadow] duration-150',
        'disabled:cursor-not-allowed disabled:opacity-[0.55] cursor-pointer',
        fullWidth ? 'w-full' : '',
        sizeClasses[size],
        variantClasses[variant],
      ].join(' ')}
      style={{ ...style, boxShadow }}
    >
      {isLoading && <Spinner size="sm" color={variant === 'primary' ? '#fff' : 'var(--accent)'} />}
      {children}
    </motion.button>
  );
}
