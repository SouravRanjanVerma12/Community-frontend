import { motion, AnimatePresence } from 'framer-motion';
import { Users2, Minus, Plus, Infinity } from 'lucide-react';

const COLLAB_COLOR = '#3a3d4a';

export default function MembersSlider({ value, onChange }) {
  const unlimited = value === 0;
  const clamp = (n) => Math.max(1, Math.min(20, n));

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-[5px]">
          <Users2 size={13} color={COLLAB_COLOR} /> Members needed
        </label>

        {/* Unlimited toggle */}
        <button
          type="button"
          onClick={() => onChange(unlimited ? 3 : 0)}
          className={`flex items-center gap-[5px] px-2.5 py-1 rounded-full cursor-pointer text-xs transition-all duration-150 ${unlimited ? 'font-bold' : 'font-medium'}`}
          style={{
            border: `1.5px solid ${unlimited ? COLLAB_COLOR : 'var(--border)'}`,
            background: unlimited ? `${COLLAB_COLOR}14` : 'transparent',
            color: unlimited ? COLLAB_COLOR : 'var(--text-muted)',
          }}
        >
          <Infinity size={13} /> No limit
        </button>
      </div>

      <AnimatePresence mode="wait">
        {unlimited ? (
          <motion.div
            key="unlimited"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-[10px]"
            style={{ background: `${COLLAB_COLOR}0d`, border: `1px solid ${COLLAB_COLOR}30` }}
          >
            <Infinity size={20} color={COLLAB_COLOR} />
            <div>
              <p className="m-0 text-[13px] font-bold" style={{ color: COLLAB_COLOR }}>Unlimited members</p>
              <p className="m-0 text-[11px] text-text-muted">Anyone can request to join this project</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slider"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="flex items-center gap-3"
          >
            {/* Decrement */}
            <motion.button
              type="button" whileTap={{ scale: 0.9 }}
              onClick={() => onChange(clamp(value - 1))} disabled={value <= 1}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                border: `1.5px solid ${value <= 1 ? 'var(--border)' : COLLAB_COLOR}`,
                background: value <= 1 ? 'transparent' : `${COLLAB_COLOR}12`,
                color: value <= 1 ? 'var(--text-muted)' : COLLAB_COLOR,
                cursor: value <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <Minus size={14} />
            </motion.button>

            {/* Track + dots */}
            <div className="flex-1 flex flex-col gap-1.5">
              <input
                type="range" min={1} max={20} value={value} onChange={(e) => onChange(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: COLLAB_COLOR }}
              />
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: Math.min(value, 20) }).map((_, i) => (
                  <motion.div
                    key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: i * 0.02, type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-2 h-2 rounded-full opacity-80"
                    style={{ background: COLLAB_COLOR }}
                  />
                ))}
              </div>
            </div>

            {/* Increment */}
            <motion.button
              type="button" whileTap={{ scale: 0.9 }}
              onClick={() => onChange(clamp(value + 1))} disabled={value >= 20}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                border: `1.5px solid ${value >= 20 ? 'var(--border)' : COLLAB_COLOR}`,
                background: value >= 20 ? 'transparent' : `${COLLAB_COLOR}12`,
                color: value >= 20 ? 'var(--text-muted)' : COLLAB_COLOR,
                cursor: value >= 20 ? 'not-allowed' : 'pointer',
              }}
            >
              <Plus size={14} />
            </motion.button>

            {/* Count badge */}
            <div
              className="min-w-12 text-center px-2.5 py-1.5 rounded-lg"
              style={{ background: `${COLLAB_COLOR}14`, border: `1px solid ${COLLAB_COLOR}30` }}
            >
              <span className="text-base font-extrabold" style={{ color: COLLAB_COLOR }}>{value}</span>
              <p className="text-[10px] opacity-70 m-0" style={{ color: COLLAB_COLOR }}>spot{value !== 1 ? 's' : ''}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
