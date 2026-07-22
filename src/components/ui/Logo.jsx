import React from 'react';
import logoLight from '../../assets/logo/logo-light-theme.png';
import logoDark from '../../assets/logo/logo-dark-theme.png';

/**
 * Prograstic Brand Logo Component
 *
 * @param {Object} props
 * @param {number} [props.size=32] - Icon width/height in px
 * @param {'auto'|'light'|'dark'} [props.variant='auto'] - Color variant override
 * @param {boolean} [props.showText=false] - Whether to show the text label 'Prograstic'
 * @param {string} [props.className=''] - Container additional classes
 * @param {string} [props.textClassName=''] - Text additional classes
 */
export default function Logo({
  size = 32,
  variant = 'auto',
  showText = false,
  className = '',
  textClassName = '',
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* Light Mode Logo (Dark Navy + Cyan emblem) */}
        {(variant === 'auto' || variant === 'light') && (
          <img
            src={logoLight}
            alt="Prograstic Logo"
            style={{ width: size, height: size }}
            className={`object-contain ${variant === 'auto' ? 'dark:hidden block' : 'block'}`}
          />
        )}

        {/* Dark Mode Logo (White + Cyan emblem) */}
        {(variant === 'auto' || variant === 'dark') && (
          <img
            src={logoDark}
            alt="Prograstic Logo"
            style={{ width: size, height: size }}
            className={`object-contain ${variant === 'auto' ? 'hidden dark:block' : 'block'}`}
          />
        )}
      </div>

      {showText && (
        <span
          className={`font-[Outfit,system-ui,sans-serif] font-bold text-lg tracking-[-0.3px] text-text-primary ${textClassName}`}
        >
          Prograstic
        </span>
      )}
    </div>
  );
}
