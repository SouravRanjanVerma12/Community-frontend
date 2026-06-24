import { motion, AnimatePresence } from 'framer-motion';
import { Users2, Minus, Plus, Infinity } from 'lucide-react';

const COLLAB_COLOR = '#3a3d4a';

export default function MembersSlider({ value, onChange }) {
  const unlimited = value === 0;
  const clamp = (n) => Math.max(1, Math.min(20, n));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Users2 size={13} color={COLLAB_COLOR} /> Members needed
        </label>

        {/* Unlimited toggle */}
        <button
          type="button"
          onClick={() => onChange(unlimited ? 3 : 0)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
            border: `1.5px solid ${unlimited ? COLLAB_COLOR : 'var(--border)'}`,
            background: unlimited ? `${COLLAB_COLOR}14` : 'transparent',
            color: unlimited ? COLLAB_COLOR : 'var(--text-muted)',
            fontSize: '12px', fontWeight: unlimited ? '700' : '500',
            transition: 'all 0.15s',
          }}
        >
          <Infinity size={13} /> No limit
        </button>
      </div>

      <AnimatePresence mode="wait">
        {unlimited ? (
          <motion.div key="unlimited"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: `${COLLAB_COLOR}0d`, border: `1px solid ${COLLAB_COLOR}30` }}>
            <Infinity size={20} color={COLLAB_COLOR} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: COLLAB_COLOR }}>Unlimited members</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Anyone can request to join this project</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="slider"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Decrement */}
            <motion.button type="button" whileTap={{ scale: 0.9 }}
              onClick={() => onChange(clamp(value - 1))} disabled={value <= 1}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${value <= 1 ? 'var(--border)' : COLLAB_COLOR}`, background: value <= 1 ? 'transparent' : `${COLLAB_COLOR}12`, color: value <= 1 ? 'var(--text-muted)' : COLLAB_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: value <= 1 ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
              <Minus size={14} />
            </motion.button>

            {/* Track + dots */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="range" min={1} max={20} value={value} onChange={(e) => onChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLLAB_COLOR, cursor: 'pointer' }} />
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {Array.from({ length: Math.min(value, 20) }).map((_, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: i * 0.02, type: 'spring', stiffness: 400, damping: 20 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: COLLAB_COLOR, opacity: 0.8 }} />
                ))}
              </div>
            </div>

            {/* Increment */}
            <motion.button type="button" whileTap={{ scale: 0.9 }}
              onClick={() => onChange(clamp(value + 1))} disabled={value >= 20}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${value >= 20 ? 'var(--border)' : COLLAB_COLOR}`, background: value >= 20 ? 'transparent' : `${COLLAB_COLOR}12`, color: value >= 20 ? 'var(--text-muted)' : COLLAB_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: value >= 20 ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
              <Plus size={14} />
            </motion.button>

            {/* Count badge */}
            <div style={{ minWidth: 48, textAlign: 'center', padding: '6px 10px', borderRadius: '8px', background: `${COLLAB_COLOR}14`, border: `1px solid ${COLLAB_COLOR}30` }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: COLLAB_COLOR }}>{value}</span>
              <p style={{ fontSize: '10px', color: COLLAB_COLOR, opacity: 0.7, margin: 0 }}>spot{value !== 1 ? 's' : ''}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
