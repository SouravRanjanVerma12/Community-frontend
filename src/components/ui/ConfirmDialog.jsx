import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const useConfirmStore = create((set) => ({
  open: false,
  message: '',
  title: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: true,
  resolve: null,
  request: (opts) =>
    new Promise((resolve) => {
      set({ open: true, resolve, ...opts });
    }),
  close: (result) => {
    set((state) => {
      state.resolve?.(result);
      return { open: false, resolve: null };
    });
  },
}));

/**
 * Promise-based replacement for window.confirm().
 * Usage: const ok = await confirm('Remove this resource?'); if (!ok) return;
 */
export function confirm(message, opts = {}) {
  return useConfirmStore.getState().request({ message, ...opts });
}

export default function ConfirmDialogHost() {
  const { open, message, title, confirmLabel, cancelLabel, danger, close } = useConfirmStore();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => close(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label={title || 'Confirm action'}
            style={{
              width: '100%', maxWidth: '380px',
              background: 'var(--card-bg)',
              borderRadius: '16px',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--shadow-popup)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                background: danger ? 'rgba(220,38,38,0.1)' : 'var(--accent-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={18} color={danger ? '#dc2626' : 'var(--accent)'} />
              </div>
              <div>
                {title && (
                  <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {title}
                  </p>
                )}
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {message}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => close(false)}
                autoFocus
                style={{
                  minHeight: '40px', padding: '8px 18px', borderRadius: '9px',
                  border: '1.5px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => close(true)}
                style={{
                  minHeight: '40px', padding: '8px 18px', borderRadius: '9px',
                  border: 'none',
                  background: danger ? '#dc2626' : 'var(--accent)',
                  color: '#fff', fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', transition: 'opacity 150ms ease',
                  boxShadow: danger ? '0 4px 14px rgba(220,38,38,0.35)' : 'var(--btn-grad-shadow)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
