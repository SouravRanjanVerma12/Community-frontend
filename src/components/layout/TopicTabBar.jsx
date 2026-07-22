import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  LayoutGrid, Globe, Server, Container,
  BrainCircuit, Smartphone, GitBranch,
  ChevronUp, ChevronDown, UserRoundSearch, Check, X, Filter, Sparkles
} from 'lucide-react';
import { DOMAINS } from '../../data/mockPosts';
import { DEV_DOMAINS } from '../../data/profileOptions';

const ICONS = {
  all:     LayoutGrid,
  webdev:  Globe,
  backend: Server,
  devops:  Container,
  aiml:    BrainCircuit,
  mobile:  Smartphone,
  oss:     GitBranch,
};

function AuthorDomainSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDomainObj = DEV_DOMAINS.find((d) => d.value === value);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Filter trigger button */}
      <div className="flex items-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-200 select-none ${
            value
              ? 'border-accent bg-accent/10 text-accent font-semibold shadow-[0_2px_12px_rgba(30,157,241,0.15)]'
              : 'border-border bg-card/60 hover:bg-surface-1 text-text-secondary hover:text-text-primary hover:border-accent/40'
          }`}
        >
          <UserRoundSearch size={13} className={value ? 'text-accent' : 'text-text-muted'} />
          <span>{selectedDomainObj ? `Author: ${selectedDomainObj.label}` : 'Author Domain'}</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </motion.button>

        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(null)}
            title="Clear author domain filter"
            className="flex items-center justify-center w-6 h-6 rounded-full border border-border bg-card text-text-muted hover:text-error hover:border-error/40 cursor-pointer transition-colors duration-150"
          >
            <X size={11} />
          </motion.button>
        )}
      </div>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-56 rounded-2xl border border-card-border bg-card/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-1.5 z-100 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-divider/60 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Filter by Author
              </span>
              {value && (
                <button
                  onClick={() => { onChange(null); setOpen(false); }}
                  className="text-[11px] text-accent hover:underline bg-none border-none cursor-pointer p-0"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5 scrollbar-thin">
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors duration-150 cursor-pointer border-none text-left ${
                  !value
                    ? 'bg-accent-dim text-accent font-semibold'
                    : 'bg-transparent text-text-secondary hover:bg-hover hover:text-text-primary'
                }`}
              >
                <span>Any domain</span>
                {!value && <Check size={13} className="text-accent" />}
              </button>

              {DEV_DOMAINS.map((d) => {
                const isSelected = value === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => { onChange(d.value); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors duration-150 cursor-pointer border-none text-left ${
                      isSelected
                        ? 'bg-accent-dim text-accent font-semibold'
                        : 'bg-transparent text-text-secondary hover:bg-hover hover:text-text-primary'
                    }`}
                  >
                    <span>{d.label}</span>
                    {isSelected && <Check size={13} className="text-accent" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TopicTabBar({
  activeDomain,
  onSelect,
  authorDomain,
  onChangeAuthorDomain,
  onHide,
}) {
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
    <div className="sticky top-[60px] z-90 bg-card/85 backdrop-blur-xl border-b border-border/80 transition-colors duration-250 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3">
        
        {/* Left fade for scroll */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-6 z-1 pointer-events-none bg-[linear-gradient(to_right,var(--card-bg),transparent)]" />
          <div className="absolute right-0 top-0 bottom-0 w-6 z-1 pointer-events-none bg-[linear-gradient(to_left,var(--card-bg),transparent)]" />

          {/* Pill strip */}
          <div
            ref={scrollRef}
            className="flex gap-1.5 px-2 py-1 overflow-x-auto flex-1 scrollbar-none items-center"
          >
            <MotionConfig transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
              {DOMAINS.map((domain) => {
                const active = activeDomain === domain.value;
                const Icon   = ICONS[domain.value] ?? LayoutGrid;
                const isAll  = domain.value === 'all';
                const activeColor = isAll ? 'var(--accent)' : domain.color;
                const activeBg    = isAll ? 'var(--accent-dim)' : `${domain.color}14`;

                return (
                  <motion.button
                    key={domain.value}
                    ref={active ? activeRef : null}
                    onClick={() => onSelect(domain.value)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full cursor-pointer whitespace-nowrap shrink-0 transition-all duration-150 ${
                      active
                        ? 'font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                        : 'font-medium hover:bg-hover'
                    }`}
                    style={{
                      border: `1.5px solid ${active ? activeColor : 'var(--border)'}`,
                      background: active ? activeBg : 'transparent',
                      color: active ? activeColor : 'var(--text-secondary)',
                      fontSize: '13px',
                    }}
                  >
                    <Icon size={13} strokeWidth={active ? 2.4 : 1.8} />
                    <span>{domain.label}</span>
                    {active && (
                      <motion.span
                        layoutId="active-dot"
                        className="w-[5px] h-[5px] rounded-full shrink-0"
                        style={{ background: activeColor }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </MotionConfig>
          </div>
        </div>

        {/* Right Filter controls: Author Domain Popover + Hide button */}
        <div className="flex items-center gap-2 shrink-0 border-l border-divider pl-3">
          {onChangeAuthorDomain && (
            <AuthorDomainSelect value={authorDomain} onChange={onChangeAuthorDomain} />
          )}

          {onHide && (
            <motion.button
              onClick={onHide}
              whileTap={{ scale: 0.9 }}
              title="Hide filter bar"
              className="flex items-center justify-center w-7 h-7 rounded-full border border-border bg-card hover:bg-surface-2 text-text-muted hover:text-text-primary cursor-pointer transition-colors duration-150"
            >
              <ChevronUp size={13} />
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
}
