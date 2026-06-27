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
          className="fixed inset-0 z-300 bg-black/40 backdrop-blur-xs flex items-center justify-center p-5"
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
            className="w-full max-w-[380px] bg-card rounded-2xl border border-card-border shadow-popup p-6"
          >
            <div className="flex gap-3 mb-5">
              <div
                className={[
                  'w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center',
                  danger ? 'bg-error-bg' : 'bg-accent-bg',
                ].join(' ')}
              >
                <AlertTriangle size={18} color={danger ? 'var(--error-text)' : 'var(--accent)'} />
              </div>
              <div>
                {title && (
                  <p className="text-[15px] font-bold text-text-primary mb-1">
                    {title}
                  </p>
                )}
                <p className="text-sm text-text-secondary leading-normal">
                  {message}
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => close(false)}
                autoFocus
                className="min-h-10 px-[18px] py-2 rounded-[9px] border-[1.5px] border-border bg-transparent text-text-secondary text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-surface-2"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => close(true)}
                className={[
                  'min-h-10 px-[18px] py-2 rounded-[9px] text-[13px] font-bold cursor-pointer',
                  'transition-opacity duration-150 hover:opacity-90',
                  danger
                    ? 'border-[1.5px] border-error-border bg-error-bg text-error'
                    : 'border-none bg-(image:--btn-grad) text-white shadow-btn',
                ].join(' ')}
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
