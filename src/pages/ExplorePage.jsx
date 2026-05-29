import { useState } from 'react';
import { Search, PenSquare, X, Type, Code2, Video, Send, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import TopicTabBar from '../components/layout/TopicTabBar';
import RightSidebar from '../components/layout/RightSidebar';
import PostFeed from '../components/feed/PostFeed';
import CreatePost from '../components/feed/CreatePost';
import { useAuthStore } from '../stores/authStore';

function SearchBar({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      animate={{ boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.14)' : '0 0 0 0px transparent' }}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#ffffff',
        border: `1.5px solid ${focused ? 'rgba(124,58,237,0.4)' : '#e4e7ec'}`,
        borderRadius: '10px', padding: '0 14px',
        transition: 'border-color 0.15s',
      }}
    >
      <Search size={14} color="#9ca3af" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search posts, topics, people…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, padding: '9px 0',
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: '14px', color: '#111827',
        }}
      />
    </motion.div>
  );
}

const POST_TYPES = [
  { value: 'text',  label: 'Text',  icon: Type  },
  { value: 'code',  label: 'Code',  icon: Code2 },
  { value: 'video', label: 'Video', icon: Video },
];

function CreatePostModal({ onClose }) {
  const { user } = useAuthStore();
  const [type, setType]   = useState('text');
  const [title, setTitle] = useState('');
  const [body, setBody]   = useState('');
  const [code, setCode]   = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onClose(); }, 1200);
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
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 0',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', letterSpacing: '-0.2px' }}>
            Create a post
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '30px', height: '30px', borderRadius: '50%',
              border: 'none', background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6b7280',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e4e7ec')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f3f4f6')}
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
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{user.name}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Posting to the community</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Post type tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {POST_TYPES.map(({ value, label, icon: Icon }) => {
              const active = type === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 14px', borderRadius: '8px',
                    border: active ? '1.5px solid rgba(124,58,237,0.4)' : '1.5px solid #e4e7ec',
                    background: active ? 'rgba(124,58,237,0.07)' : 'transparent',
                    color: active ? '#7c3aed' : '#6b7280',
                    fontSize: '13px', fontWeight: active ? '600' : '400',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title…"
            autoFocus
            style={{
              padding: '11px 14px', borderRadius: '10px',
              border: '1.5px solid #e4e7ec', background: '#f9fafb',
              fontSize: '15px', fontWeight: '500', color: '#111827',
              outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.4)')}
            onBlur={(e) => (e.target.style.borderColor = '#e4e7ec')}
          />

          {/* Body */}
          {type !== 'video' && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={type === 'code' ? 'Brief description of the snippet…' : 'Write your post…'}
              rows={4}
              style={{
                padding: '11px 14px', borderRadius: '10px',
                border: '1.5px solid #e4e7ec', background: '#f9fafb',
                fontSize: '14px', color: '#374151', lineHeight: '1.6',
                resize: 'vertical', outline: 'none',
                fontFamily: 'inherit', transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.4)')}
              onBlur={(e) => (e.target.style.borderColor = '#e4e7ec')}
            />
          )}

          {/* Code editor */}
          {type === 'code' && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here…"
              rows={7}
              style={{
                padding: '12px 14px', borderRadius: '10px',
                border: '1.5px solid #e4e7ec', background: '#1e1e2e',
                fontSize: '13px', color: '#cdd6f4', lineHeight: '1.65',
                resize: 'vertical', outline: 'none',
                fontFamily: 'ui-monospace, Consolas, monospace',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.4)')}
              onBlur={(e) => (e.target.style.borderColor = '#e4e7ec')}
            />
          )}

          {/* Video URL */}
          {type === 'video' && (
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or video URL…"
              style={{
                padding: '11px 14px', borderRadius: '10px',
                border: '1.5px solid #e4e7ec', background: '#f9fafb',
                fontSize: '14px', color: '#374151', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(124,58,237,0.4)')}
              onBlur={(e) => (e.target.style.borderColor = '#e4e7ec')}
            />
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: '#f3f4f6' }} />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: '9px',
                border: '1.5px solid #e4e7ec', background: 'transparent',
                color: '#6b7280', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={!title.trim() || submitted}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 22px', borderRadius: '9px', border: 'none',
                background: submitted ? '#dcfce7' : !title.trim() ? '#ddd6fe' : '#7c3aed',
                color: submitted ? '#16a34a' : '#fff',
                fontSize: '14px', fontWeight: '600',
                cursor: title.trim() && !submitted ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <Send size={14} />
              {submitted ? 'Posted!' : 'Publish post'}
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
  const [activeDomain, setActiveDomain] = useState('all');
  const [search, setSearch]             = useState('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [filtersOpen, setFiltersOpen]   = useState(true);

  return (
    <div style={{ minHeight: '100svh', background: '#f8f9fb' }}>
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
              fontSize: '18px', fontWeight: '700', color: '#111827',
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
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '20px',
                  border: '1.5px solid #e4e7ec', background: '#fff',
                  color: '#6b7280', fontSize: '12px', fontWeight: '500',
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
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', borderRadius: '9px',
                border: 'none', background: '#7c3aed', color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                flexShrink: 0, transition: 'box-shadow 0.2s',
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
        {modalOpen && <CreatePostModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>

      <style>{`
        .explore-right { display: block; }
        @media (max-width: 960px) { .explore-right { display: none; } }
        @media (max-width: 600px) {
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
