import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, PenSquare, X, Type, Code2, Video, Send, ChevronDown, Users2, Plus, Loader2, Compass, SlidersHorizontal, Handshake } from 'lucide-react';
import MembersSlider from '../components/feed/MembersSlider';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import TopicTabBar from '../components/layout/TopicTabBar';
import RightSidebar from '../components/layout/RightSidebar';
import LeftSidebar from '../components/layout/LeftSidebar';
import PostFeed from '../components/feed/PostFeed';
import CreatePost from '../components/feed/CreatePost';
import { useAuthStore } from '../stores/authStore';
import { DEV_DOMAINS } from '../data/profileOptions';
import { queryClient } from '../api/queryClient';
import api from '../api/axiosInstance';

function SearchBar({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      animate={{ boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : '0 0 0 0px transparent' }}
      className={`flex items-center gap-2 bg-card rounded-[10px] px-3.5 border-[1.5px] transition-colors duration-150 ${focused ? 'border-accent-border' : 'border-border'}`}
    >
      <Search size={14} color="var(--text-muted)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search posts, topics, people…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 py-2.5 bg-transparent border-none outline-none text-sm text-text-primary"
      />
    </motion.div>
  );
}

const COLLAB_COLOR = 'var(--accent, #1e9df1)';
const PRESET_ROLES = DEV_DOMAINS.map((d) => d.label);
const fieldClasses = 'w-full px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 focus:border-accent-border';

const POST_TYPES = [
  { value: 'text',   label: 'Text',   icon: Type   },
  { value: 'code',   label: 'Code',   icon: Code2  },
  // { value: 'video',  label: 'Video',  icon: Video  },
  { value: 'collab', label: 'Collab', icon: Handshake },
];

function TagInput({ tags, onAdd, onRemove, placeholder, presets }) {
  const [input, setInput] = useState('');
  const add = (val) => { const v = val.trim(); if (v && !tags.includes(v)) onAdd(v); setInput(''); };
  return (
    <div className="flex flex-col gap-2">
      {presets && (
        <div className="flex flex-wrap gap-[5px]">
          {presets.filter((p) => !tags.includes(p)).map((p) => (
            <button
              key={p} type="button" onClick={() => onAdd(p)}
              className="min-h-7 px-2.5 py-[3px] rounded-full text-xs cursor-pointer flex items-center gap-[3px]"
              style={{ border: `1px solid ${COLLAB_COLOR}40`, background: `${COLLAB_COLOR}0d`, color: COLLAB_COLOR }}
            >
              <Plus size={10} /> {p}
            </button>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-[5px]">
          {tags.map((t) => (
            <span key={t} className="px-2.5 py-[3px] rounded-full text-white text-xs font-medium flex items-center gap-1" style={{ background: COLLAB_COLOR }}>
              {t}
              <button type="button" onClick={() => onRemove(t)} aria-label={`Remove ${t}`}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-none border-none cursor-pointer text-white/80 leading-none p-0 text-sm">×</button>
            </span>
          ))}
        </div>
      )}
      {!presets && (
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
          onBlur={() => add(input)}
          placeholder={placeholder}
          className="px-3 py-2 rounded-lg border-[1.5px] border-border bg-input text-[13px] text-text-primary outline-none focus:border-[#3a3d4a]"
        />
      )}
    </div>
  );
}

function CreatePostModal({ onClose, initialType = 'text' }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [type, setType]       = useState(initialType);
  const [domain, setDomain]   = useState(() => user?.domain?.[0] || DEV_DOMAINS[0].value);
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [code, setCode]       = useState('');
  const [videoUrl, setVideoUrl]     = useState('');
  const [projectName, setProjectName] = useState('');
  const [techStack,     setTechStack]     = useState([]);
  const [rolesNeeded,   setRolesNeeded]   = useState([]);
  const [membersNeeded, setMembersNeeded] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const isCollab = type === 'collab';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true); setError('');
    try {
      const { data } = await api.post('/posts', {
        type, domain, title: title.trim(),
        body: body.trim(), codeSnippet: code.trim(),
        language: 'javascript', videoUrl: videoUrl.trim(),
        projectName: projectName.trim(), techStack, rolesNeeded, membersNeeded,
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (isCollab) {
        queryClient.invalidateQueries({ queryKey: ['collab-posts'] });
        queryClient.invalidateQueries({ queryKey: ['my-collab-posts'] });
        queryClient.invalidateQueries({ queryKey: ['my-collab-posts-ws'] });
        queryClient.invalidateQueries({ queryKey: ['my-collab-requests-workspace'] });
        onClose();
        navigate(`/project/${data.post._id}`);
        return;
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-300 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 140, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[620px] max-h-[92vh] sm:max-h-[88vh] bg-card rounded-t-[28px] sm:rounded-[24px] border-t sm:border border-border/50 shadow-[0_-12px_40px_rgba(0,0,0,0.4)] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
      >
        <div className="w-10 h-1 rounded-full bg-border/80 mx-auto mt-2.5 sm:hidden shrink-0" />

        <div className="flex items-center justify-between pt-3.5 sm:pt-5 pb-3.5 px-4 sm:px-6 shrink-0 border-b border-border/40">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
            Create a post
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-border/50 bg-surface-1 hover:bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {user && (
          <div className="flex items-center gap-2.5 px-4 sm:px-6 pt-3.5 pb-1 shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full object-cover shrink-0 border border-border/50"
              />
            ) : (
              <div
                className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full shrink-0 text-white flex items-center justify-center text-sm font-bold"
                style={{ background: `hsl(${[...user.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)` }}
              >
                {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div>
              <p className="text-xs sm:text-sm font-semibold text-text-primary leading-tight">{user.name}</p>
              <p className="text-[11px] sm:text-xs text-text-muted">Posting to the community</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

        <div className="px-4 sm:px-6 py-4 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto scrollbar-none *:shrink-0">

          <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 max-w-full">
              {POST_TYPES.map(({ value, label, icon: Icon }) => {
                const active = type === value;
                const color  = value === 'collab' ? COLLAB_COLOR : 'var(--accent)';
                return (
                  <button
                    key={value} type="button" onClick={() => setType(value)}
                    className={`flex items-center gap-[5px] min-h-8 px-3.5 py-1.5 rounded-lg text-[13px] cursor-pointer whitespace-nowrap shrink-0 transition-colors duration-150 ${active ? 'font-semibold' : 'font-normal'}`}
                    style={{
                      border: active ? `1.5px solid ${color}60` : '1.5px solid var(--border)',
                      background: active ? (value === 'collab' ? COLLAB_COLOR : 'var(--accent-bg)') : 'transparent',
                      color: active ? (value === 'collab' ? '#fff' : 'var(--accent)') : 'var(--text-secondary)',
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </div>

            <select
              value={domain} onChange={(e) => setDomain(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg border border-border text-[13px] text-text-secondary bg-card cursor-pointer outline-none focus:border-accent"
            >
              {DEV_DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {isCollab && (
            <>
              <div className="px-3.5 py-2.5 rounded-[10px] flex items-center gap-2" style={{ background: `${COLLAB_COLOR}0d`, border: `1px solid ${COLLAB_COLOR}30` }}>
                <Handshake size={15} color={COLLAB_COLOR} className="shrink-0" />
                <span className="text-xs font-semibold" style={{ color: COLLAB_COLOR }}>Collab Post — looking for collaborators</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-0.5">What do you want to collab on?</label>
                <input
                  value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. An open-source CLI tool, a SaaS side project… (optional)"
                  className={fieldClasses}
                />
              </div>
            </>
          )}

          <input
            value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required
            placeholder={isCollab ? 'Describe what you need help with or are looking to build together…' : 'Post title…'}
            className={`${fieldClasses} focus:border-accent-border`}
          />

          {type !== 'video' && (
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)} rows={4}
              placeholder={isCollab ? "Describe the project, what stage it's at, and what you're looking for…" : type === 'code' ? 'Brief description…' : 'Write your post…'}
              className={`${fieldClasses} resize-y ${isCollab ? 'focus:border-[#3a3d4a]' : 'focus:border-accent-border'}`}
            />
          )}

          {type === 'code' && (
            <textarea
              value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Paste your code here…" rows={7}
              className="px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-code-bg text-[13px] text-code-text leading-[1.65] resize-y font-mono outline-none transition-colors duration-150 focus:border-accent-border"
            />
          )}

          {type === 'video' && (
            <input
              value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Paste YouTube or video URL…"
              className={fieldClasses}
            />
          )}

          {isCollab && (
            <>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tech Stack</p>
                <TagInput tags={techStack} onAdd={(t) => setTechStack((s) => [...s, t])} onRemove={(t) => setTechStack((s) => s.filter((x) => x !== t))} placeholder="Type a tech and press Enter (e.g. React, Node.js)" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Roles Needed</p>
                <TagInput tags={rolesNeeded} onAdd={(r) => setRolesNeeded((s) => [...s, r])} onRemove={(r) => setRolesNeeded((s) => s.filter((x) => x !== r))} presets={PRESET_ROLES} />
              </div>
              <MembersSlider value={membersNeeded} onChange={setMembersNeeded} />
            </>
          )}

          {error && <p className="text-[13px] text-error m-0">{error}</p>}

        </div>

        <div className="flex justify-end gap-2 px-4 sm:px-6 py-3.5 border-t border-divider shrink-0 bg-card">
          <button
            type="button" onClick={onClose}
            className="flex-1 sm:flex-none min-h-11 px-4.5 py-2 rounded-[11px] border-[1.5px] border-border bg-transparent text-text-secondary text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            type="submit" whileTap={{ scale: 0.97 }} disabled={!title.trim() || submitting}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-[7px] min-h-11 px-5.5 py-2 rounded-[11px] border-none text-white text-sm font-semibold transition-colors duration-200 ${title.trim() && !submitting ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            style={{ background: !title.trim() ? 'var(--accent-dim)' : isCollab ? COLLAB_COLOR : 'var(--accent)' }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : isCollab ? <Users2 size={14} /> : <Send size={14} />}
            {submitting ? 'Posting…' : isCollab ? 'Post Collab' : 'Publish post'}
          </motion.button>
        </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const DOMAIN_LABELS = {
  all: 'Explore', webdev: 'Web Dev', backend: 'Backend',
  devops: 'DevOps', aiml: 'AI / ML', mobile: 'Mobile',
  oss: 'Open Source',
};

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDomain, setActiveDomain] = useState('all');
  const [authorDomain, setAuthorDomain] = useState(null);
  const [search, setSearch]             = useState('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [createType, setCreateType]     = useState('text');

  useEffect(() => {
    const create = searchParams.get('create');
    if (create) {
      setCreateType(create === 'collab' ? 'collab' : 'text');
      setModalOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('create');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate (re-runs on every URL change, not just mount) so a search result
  // clicked while already on /explore — a query-string-only navigation that
  // doesn't remount this component — still applies.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearch(q);
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next, { replace: true });
    }

    const dom = searchParams.get('domain');
    if (dom) {
      setActiveDomain(dom);
      const next = new URLSearchParams(searchParams);
      next.delete('domain');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-svh bg-surface-0 transition-colors duration-250">
      <Navbar />
      {filtersOpen && (
        <TopicTabBar
          activeDomain={activeDomain}
          onSelect={setActiveDomain}
          authorDomain={authorDomain}
          onChangeAuthorDomain={setAuthorDomain}
          onHide={() => setFiltersOpen(false)}
        />
      )}

      <div className="max-w-[1400px] mx-auto p-5 grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_280px] gap-6 items-start">
        {/* Left sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>

        {/* Main feed column */}
        <main className="min-w-0">
          {/* Heading row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5 p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-accent-bg text-accent flex items-center justify-center shrink-0 shadow-xs">
                <Compass size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight m-0 truncate">
                    {DOMAIN_LABELS[activeDomain] ?? 'Explore Feed'}
                  </h1>
                  {activeDomain !== 'all' && (
                    <span className="text-[10px] font-bold text-accent bg-accent-bg px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      {activeDomain}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted m-0 mt-0.5 line-clamp-1">
                  Discover discussions, code snippets & collaboration projects
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto">
              {/* Toggle Filters button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltersOpen((prev) => !prev)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 border ${
                  filtersOpen
                    ? 'border-accent bg-accent-bg text-accent shadow-sm'
                    : 'border-border/80 bg-surface-1 hover:bg-surface-2 text-text-secondary hover:text-text-primary'
                }`}
              >
                <SlidersHorizontal size={14} className={filtersOpen ? 'text-accent' : 'text-text-muted'} />
                <span>Filters</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180 text-accent' : ''}`}
                />
              </motion.button>

              {/* Create post button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 min-h-[38px] rounded-xl border-none bg-(image:--btn-grad) text-white text-xs font-bold cursor-pointer shadow-btn transition-all"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Create post</span>
              </motion.button>
            </div>
          </div>

          {/* Search
          <div className="mb-4">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          */}

          {/* Quick composer */}
          <div className="mb-4">
            <CreatePost onOpenModal={(type) => { setCreateType(type); setModalOpen(true); }} />
          </div>

          {/* Feed */}
          <PostFeed domain={activeDomain} search={search} authorDomain={authorDomain} />
        </main>

        {/* Right sidebar */}
        <div className="hidden xl:block">
          <RightSidebar />
        </div>
      </div>

      {/* Create post modal */}
      <AnimatePresence>
        {modalOpen && <CreatePostModal onClose={() => setModalOpen(false)} initialType={createType} />}
      </AnimatePresence>
    </div>
  );
}
