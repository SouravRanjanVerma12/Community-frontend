import { useRef, useEffect } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import {
  LayoutGrid, Globe, Server, Container,
  BrainCircuit, Smartphone, GitBranch, Briefcase,
  ChevronUp,
} from 'lucide-react';
import { DOMAINS } from '../../data/mockPosts';

const ICONS = {
  all:     LayoutGrid,
  webdev:  Globe,
  backend: Server,
  devops:  Container,
  aiml:    BrainCircuit,
  mobile:  Smartphone,
  oss:     GitBranch,
  career:  Briefcase,
};

export default function TopicTabBar({ activeDomain, onSelect, onHide }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const el   = activeRef.current;
      const bar  = scrollRef.current;
      const left = el.offsetLeft - bar.offsetWidth / 2 + el.offsetWidth / 2;
      bar.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeDomain]);

  return (
    <div style={{
      position: 'sticky',
      top: '60px',
      zIndex: 90,
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

        {/* Left fade */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '32px', background: 'linear-gradient(to right, var(--nav-bg), transparent)', zIndex: 1, pointerEvents: 'none' }} />
        {/* Right fade — leaves room for the hide button */}
        <div style={{ position: 'absolute', right: '44px', top: 0, bottom: 0, width: '32px', background: 'linear-gradient(to left, var(--nav-bg), transparent)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Pill strip */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: '6px',
            padding: '10px 20px',
            overflowX: 'auto', scrollbarWidth: 'none',
            flex: 1,
          }}
        >
          <MotionConfig transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
            {DOMAINS.map((domain) => {
              const active = activeDomain === domain.value;
              const Icon   = ICONS[domain.value] ?? LayoutGrid;
              return (
                <motion.button
                  key={domain.value}
                  ref={active ? activeRef : null}
                  onClick={() => onSelect(domain.value)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '20px',
                    border: `1.5px solid ${active ? domain.color : 'var(--border)'}`,
                    background: active ? `${domain.color}14` : 'transparent',
                    color: active ? domain.color : 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: active ? '600' : '500',
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = `${domain.color}60`;
                      e.currentTarget.style.color = domain.color;
                      e.currentTarget.style.background = `${domain.color}08`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={13} strokeWidth={active ? 2.5 : 2} />
                  <span>{domain.label}</span>
                  {active && (
                    <motion.span
                      layoutId="active-dot"
                      style={{ width: '5px', height: '5px', borderRadius: '50%', background: domain.color, flexShrink: 0 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </MotionConfig>
        </div>

        {/* Hide button */}
        <motion.button
          onClick={onHide}
          whileTap={{ scale: 0.9 }}
          title="Hide filters"
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '50%',
            border: '1.5px solid var(--border)', background: 'var(--surface-2)',
            color: 'var(--text-muted)', cursor: 'pointer', margin: '0 12px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
        >
          <ChevronUp size={13} />
        </motion.button>
      </div>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
