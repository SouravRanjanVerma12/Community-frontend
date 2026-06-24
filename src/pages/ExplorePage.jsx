import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, PenSquare, X, Type, Code2, Video, Send, ChevronDown, Users2, Plus, Loader2 } from 'lucide-react';
import MembersSlider from '../components/feed/MembersSlider';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import TopicTabBar from '../components/layout/TopicTabBar';
import RightSidebar from '../components/layout/RightSidebar';
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
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'var(--card-bg)',
        border: `1.5px solid ${focused ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: '10px', padding: '0 14px',
        transition: 'border-color 0.15s, background 0.25s',
      }}
    >
      <Search size={14} color="var(--text-muted)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search posts, topics, people…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, padding: '9px 0',
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: '14px', color: 'var(--text-primary)',
        }}
      />
    </motion.div>
  );
}

const COLLAB_COLOR = '#0891b2';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {presets && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {presets.filter((p) => !tags.includes(p)).map((p) => (
            <button key={p} type="button" onClick={() => onAdd(p)}
              className="explore-focusable"
              style={{ minHeight: '28px', padding: '3px 10px', borderRadius: '20px', border: `1px solid ${COLLAB_COLOR}40`, background: `${COLLAB_COLOR}0d`, color: COLLAB_COLOR, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Plus size={10} /> {p}
            </button>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {tags.map((t) => (
            <span key={t} style={{ padding: '3px 10px', borderRadius: '20px', background: COLLAB_COLOR, color: '#fff', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t}
              <button type="button" onClick={() => onRemove(t)} aria-label={`Remove ${t}`}
                className="explore-focusable"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', lineHeight: 1, padding: 0, fontSize: '14px' }}>×</button>
            </span>
          ))}
        </div>
      )}
      {!presets && (
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
          placeholder={placeholder}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}
          onFocus={(e) => (e.target.style.borderColor = COLLAB_COLOR)}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; add(input); }} />
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
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '580px',
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--shadow-popup)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 0',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            Create a post
          </h2>
          <button
            onClick={onClose}
            className="explore-focusable"
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: 'none', background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          >
            <X size={15} />
          </button>
        </div>

        {/* Author row */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 22px 0' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: `hsl(${[...user.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700',
            }}>
              {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Posting to the community</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto' }}>

          {/* Type tabs + domain */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {POST_TYPES.map(({ value, label, icon: Icon }) => {
              const active = type === value;
              const color  = value === 'collab' ? COLLAB_COLOR : 'var(--accent)';
              return (
                <button key={value} type="button" onClick={() => setType(value)}
                  className="explore-focusable"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    minHeight: '32px',
                    padding: '6px 14px', borderRadius: '8px',
                    border: active ? `1.5px solid ${color}60` : '1.5px solid var(--border)',
                    background: active ? (value === 'collab' ? COLLAB_COLOR : 'var(--accent-bg)') : 'transparent',
                    color: active ? (value === 'collab' ? '#fff' : 'var(--accent)') : 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: active ? '600' : '400', cursor: 'pointer', transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
                  }}>
                  <Icon size={13} /> {label}
                </button>
              );
            })}
            <select value={domain} onChange={(e) => setDomain(e.target.value)}
              style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--card-bg)', cursor: 'pointer', outline: 'none' }}>
              {DOMAINS.filter((d) => d.value !== 'all').map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Collab banner */}
          {isCollab && (
            <>
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: `${COLLAB_COLOR}0d`, border: `1px solid ${COLLAB_COLOR}30`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users2 size={14} color={COLLAB_COLOR} />
                <span style={{ fontSize: '13px', color: COLLAB_COLOR, fontWeight: '600' }}>Collab Post — looking for collaborators</span>
              </div>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name (optional)"
                style={{ padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={(e) => (e.target.style.borderColor = COLLAB_COLOR)}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            </>
          )}

          {/* Title */}
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required
            placeholder={isCollab ? 'What are you building? What help do you need?' : 'Post title…'}
            style={{ padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={(e) => (e.target.style.borderColor = isCollab ? COLLAB_COLOR : 'var(--accent-border)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />

          {/* Body */}
          {type !== 'video' && (
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={isCollab ? 4 : 4}
              placeholder={isCollab ? "Describe the project, what stage it's at, and what you're looking for…" : type === 'code' ? 'Brief description…' : 'Write your post…'}
              style={{ padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
              onFocus={(e) => (e.target.style.borderColor = isCollab ? COLLAB_COLOR : 'var(--accent-border)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          )}

          {/* Code */}
          {type === 'code' && (
            <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Paste your code here…" rows={7}
              style={{ padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--code-bg)', fontSize: '13px', color: 'var(--code-text)', lineHeight: '1.65', resize: 'vertical', outline: 'none', fontFamily: 'ui-monospace, Consolas, monospace', transition: 'border-color 0.15s' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          )}

          {/* Video */}
          {type === 'video' && (
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Paste YouTube or video URL…"
              style={{ padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-secondary)', outline: 'none', transition: 'border-color 0.15s' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          )}

          {/* Collab: tech stack + roles */}
          {isCollab && (
            <>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Tech Stack</p>
                <TagInput tags={techStack} onAdd={(t) => setTechStack((s) => [...s, t])} onRemove={(t) => setTechStack((s) => s.filter((x) => x !== t))} placeholder="Type a tech and press Enter (e.g. React, Node.js)" />
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Roles Needed</p>
                <TagInput tags={rolesNeeded} onAdd={(r) => setRolesNeeded((s) => [...s, r])} onRemove={(r) => setRolesNeeded((s) => s.filter((x) => x !== r))} presets={PRESET_ROLES} />
              </div>
              <MembersSlider value={membersNeeded} onChange={setMembersNeeded} />
            </>
          )}

          {error && <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>}

          <div style={{ height: '1px', background: 'var(--divider)' }} />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose}
              className="explore-focusable"
              style={{ minHeight: '44px', padding: '9px 18px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Cancel
            </button>
            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!title.trim() || submitting}
              className="explore-focusable"
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', minHeight: '44px', padding: '9px 22px', borderRadius: '9px', border: 'none',
                background: !title.trim() ? 'var(--accent-dim)' : isCollab ? COLLAB_COLOR : 'var(--accent)',
                color: '#fff', fontSize: '14px', fontWeight: '600',
                cursor: title.trim() && !submitting ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s',
              }}>
              {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : isCollab ? <Users2 size={14} /> : <Send size={14} />}
              {submitting ? 'Posting…' : isCollab ? 'Post Collab' : 'Publish post'}
            </motion.button>
          </div>
        </form>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  const [filtersOpen, setFiltersOpen]   = useState(true);
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
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)', transition: 'background 0.25s' }}>
      <Navbar />
      {filtersOpen && (
        <TopicTabBar
          activeDomain={activeDomain}
          onSelect={setActiveDomain}
          onHide={() => setFiltersOpen(false)}
        />
      )}

      <div style={{
        maxWidth: '1160px', margin: '0 auto',
        padding: '20px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Main feed column */}
        <main style={{ minWidth: 0 }}>
          {/* Heading row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <h1 style={{
              fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)',
              letterSpacing: '-0.3px', flex: 1,
            }}>
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
                className="explore-focusable"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  minHeight: '44px', padding: '6px 12px', borderRadius: '20px',
                  border: '1.5px solid var(--border)', background: 'var(--card-bg)',
                  color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <ChevronDown size={13} /> Filters
              </motion.button>
            )}

            {/* Create post button */}
            <motion.button
              whileHover={{ boxShadow: '0 4px 16px rgba(124,58,237,0.30)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModalOpen(true)}
              className="explore-focusable"
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                minHeight: '44px', padding: '8px 16px', borderRadius: '9px',
                border: 'none', background: 'var(--accent)', color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                flexShrink: 0, transition: 'box-shadow 200ms ease',
              }}
            >
              <PenSquare size={14} />
              Create post
            </motion.button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* Quick composer */}
          <div style={{ marginBottom: '16px' }}>
            <CreatePost />
          </div>

          {/* Feed */}
          <PostFeed domain={activeDomain} search={search} />
        </main>

        {/* Right sidebar */}
        <div className="explore-right">
          <RightSidebar />
        </div>
      </div>

      {/* Create post modal */}
      <AnimatePresence>
        {modalOpen && <CreatePostModal onClose={() => setModalOpen(false)} initialType={createType} />}
      </AnimatePresence>

      <style>{`
        .explore-right { display: block; }
        @media (max-width: 960px) { .explore-right { display: none; } }
        @media (max-width: 600px) {
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
        .explore-focusable:focus-visible,
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
