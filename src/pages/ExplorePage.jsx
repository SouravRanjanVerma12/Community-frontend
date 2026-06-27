import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, PenSquare, X, Type, Code2, Video, Send, ChevronDown, Users2, Plus, Loader2 } from 'lucide-react';
import MembersSlider from '../components/feed/MembersSlider';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import TopicTabBar from '../components/layout/TopicTabBar';
import RightSidebar from '../components/layout/RightSidebar';
import LeftSidebar from '../components/layout/LeftSidebar';
import PostFeed from '../components/feed/PostFeed';
import CreatePost from '../components/feed/CreatePost';
import { useAuthStore } from '../stores/authStore';
import { DOMAINS } from '../data/mockPosts';
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

const COLLAB_COLOR = '#3a3d4a';
const PRESET_ROLES = ['Frontend Dev', 'Backend Dev', 'Full Stack', 'Designer', 'DevOps', 'ML Engineer', 'Mobile Dev', 'QA'];

const POST_TYPES = [
  { value: 'text',   label: 'Text',   icon: Type   },
  { value: 'code',   label: 'Code',   icon: Code2  },
  { value: 'video',  label: 'Video',  icon: Video  },
  { value: 'collab', label: 'Collab', icon: Users2 },
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
  const [domain, setDomain]   = useState('webdev');
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
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-200 bg-black/35 backdrop-blur-xs flex items-center justify-center p-5"
    >
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[580px] bg-card rounded-2xl border border-card-border shadow-popup overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between pt-4.5 px-5.5">
          <h2 className="text-base font-bold text-text-primary tracking-[-0.2px]">
            Create a post
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full border-none bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary transition-colors duration-150 hover:bg-surface-3"
          >
            <X size={15} />
          </button>
        </div>

        {/* Author row */}
        {user && (
          <div className="flex items-center gap-2.5 px-5.5 pt-3.5">
            <div
              className="w-9.5 h-9.5 rounded-full shrink-0 text-white flex items-center justify-center text-sm font-bold"
              style={{ background: `hsl(${[...user.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)` }}
            >
              {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{user.name}</p>
              <p className="text-xs text-text-muted">Posting to the community</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-5.5 pt-4 pb-5.5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">

          {/* Type tabs + domain */}
          <div className="flex gap-1.5 flex-wrap items-center">
            {POST_TYPES.map(({ value, label, icon: Icon }) => {
              const active = type === value;
              const color  = value === 'collab' ? COLLAB_COLOR : 'var(--accent)';
              return (
                <button
                  key={value} type="button" onClick={() => setType(value)}
                  className={`flex items-center gap-[5px] min-h-8 px-3.5 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors duration-150 ${active ? 'font-semibold' : 'font-normal'}`}
                  style={{
                    border: active ? `1.5px solid ${color}60` : '1.5px solid var(--border)',
                    background: active ? (value === 'collab' ? COLLAB_COLOR : 'var(--accent-bg)') : 'transparent',
                    color: active ? (value === 'collab' ? '#fff' : 'var(--accent)') : 'var(--text-secondary)',
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              );
            })}
            <select
              value={domain} onChange={(e) => setDomain(e.target.value)}
              className="ml-auto px-2.5 py-1.5 rounded-lg border-[1.5px] border-border text-[13px] text-text-secondary bg-card cursor-pointer outline-none"
            >
              {DOMAINS.filter((d) => d.value !== 'all').map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Collab banner */}
          {isCollab && (
            <>
              <div className="px-3.5 py-2.5 rounded-[10px] flex items-center gap-2" style={{ background: `${COLLAB_COLOR}0d`, border: `1px solid ${COLLAB_COLOR}30` }}>
                <Users2 size={14} color={COLLAB_COLOR} />
                <span className="text-[13px] font-semibold" style={{ color: COLLAB_COLOR }}>Collab Post — looking for collaborators</span>
              </div>
              <input
                value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name (optional)"
                className="px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 focus:border-[#3a3d4a]"
              />
            </>
          )}

          {/* Title */}
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required
            placeholder={isCollab ? 'What are you building? What help do you need?' : 'Post title…'}
            className={`px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-[15px] font-medium text-text-primary outline-none transition-colors duration-150 ${isCollab ? 'focus:border-[#3a3d4a]' : 'focus:border-accent-border'}`}
          />

          {/* Body */}
          {type !== 'video' && (
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)} rows={4}
              placeholder={isCollab ? "Describe the project, what stage it's at, and what you're looking for…" : type === 'code' ? 'Brief description…' : 'Write your post…'}
              className={`px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-secondary leading-relaxed resize-y font-[inherit] outline-none transition-colors duration-150 ${isCollab ? 'focus:border-[#3a3d4a]' : 'focus:border-accent-border'}`}
            />
          )}

          {/* Code */}
          {type === 'code' && (
            <textarea
              value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Paste your code here…" rows={7}
              className="px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-code-bg text-[13px] text-code-text leading-[1.65] resize-y font-mono outline-none transition-colors duration-150 focus:border-accent-border"
            />
          )}

          {/* Video */}
          {type === 'video' && (
            <input
              value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Paste YouTube or video URL…"
              className="px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-secondary outline-none transition-colors duration-150 focus:border-accent-border"
            />
          )}

          {/* Collab: tech stack + roles */}
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

          <div className="h-px bg-divider" />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button" onClick={onClose}
              className="min-h-11 px-4.5 py-2 rounded-[9px] border-[1.5px] border-border bg-transparent text-text-secondary text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              type="submit" whileTap={{ scale: 0.97 }} disabled={!title.trim() || submitting}
              className={`flex items-center gap-[7px] min-h-11 px-5.5 py-2 rounded-[9px] border-none text-white text-sm font-semibold transition-colors duration-200 ${title.trim() && !submitting ? 'cursor-pointer' : 'cursor-not-allowed'}`}
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
  oss: 'Open Source', career: 'Career',
};

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDomain, setActiveDomain] = useState('all');
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

  return (
    <div className="min-h-svh bg-surface-0 transition-colors duration-250">
      <Navbar />
      {filtersOpen && (
        <TopicTabBar
          activeDomain={activeDomain}
          onSelect={setActiveDomain}
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
          <div className="flex items-center gap-2.5 mb-3">
            <h1 className="text-lg font-bold text-text-primary tracking-[-0.3px] flex-1">
              {DOMAIN_LABELS[activeDomain] ?? 'Explore'}
            </h1>

            {/* Show filters button — only when bar is hidden */}
            {!filtersOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltersOpen(true)}
                title="Show filters"
                className="flex items-center gap-[5px] min-h-11 px-3 py-1.5 rounded-full border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium cursor-pointer shrink-0"
              >
                <ChevronDown size={13} /> Filters
              </motion.button>
            )}

            {/* Create post button */}
            <motion.button
              whileHover={{ boxShadow: 'var(--btn-grad-shadow-hover)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-[7px] min-h-11 px-4 py-2 rounded-[9px] border-none bg-(image:--btn-grad) text-white text-[13px] font-semibold cursor-pointer shrink-0 transition-shadow duration-200 shadow-btn"
            >
              <PenSquare size={14} />
              Create post
            </motion.button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* Quick composer */}
          <div className="mb-4">
            <CreatePost />
          </div>

          {/* Feed */}
          <PostFeed domain={activeDomain} search={search} />
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
