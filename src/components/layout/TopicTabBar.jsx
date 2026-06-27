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
    <div className="sticky top-[60px] z-90 bg-nav border-b border-nav-border transition-colors duration-250">
      <div className="relative flex items-center">

        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 z-1 pointer-events-none bg-[linear-gradient(to_right,var(--nav-bg),transparent)]" />
        {/* Right fade — leaves room for the hide button */}
        <div className="absolute right-11 top-0 bottom-0 w-8 z-1 pointer-events-none bg-[linear-gradient(to_left,var(--nav-bg),transparent)]" />

        {/* Pill strip */}
        <div
          ref={scrollRef}
          className="flex gap-1.5 px-5 py-2.5 overflow-x-auto flex-1 scrollbar-none"
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full cursor-pointer whitespace-nowrap shrink-0 transition-[border-color,background-color,color] duration-150"
                  style={{
                    border: `1.5px solid ${active ? domain.color : 'var(--border)'}`,
                    background: active ? `${domain.color}14` : 'transparent',
                    color: active ? domain.color : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: active ? '600' : '500',
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
                      className="w-[5px] h-[5px] rounded-full shrink-0"
                      style={{ background: domain.color }}
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
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-[1.5px] border-border bg-surface-2 text-text-muted cursor-pointer mx-3 transition-colors duration-150 hover:bg-surface-3"
        >
          <ChevronUp size={13} />
        </motion.button>
      </div>
    </div>
  );
}
