import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Code2, Video, Send, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { DOMAINS } from '../../data/mockPosts';
import { queryClient } from '../../api/queryClient';
import api from '../../api/axiosInstance';

function Avatar({ name, src, size = 38 }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const hue = [...(name ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '600', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

const POST_TYPES = [
  { value: 'text',  label: 'Text',  icon: Type  },
  { value: 'code',  label: 'Code',  icon: Code2 },
  { value: 'video', label: 'Video', icon: Video },
];

export default function CreatePost() {
  const { user } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const [type, setType]         = useState('text');
  const [domain, setDomain]     = useState('webdev');
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [code, setCode]         = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const close = () => {
    setExpanded(false);
    setTitle(''); setBody(''); setCode(''); setVideoUrl('');
    setType('text'); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/posts', {
        type, domain, title: title.trim(),
        body:        body.trim(),
        codeSnippet: code.trim(),
        language:    'javascript',
        videoUrl:    videoUrl.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      close();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '14px', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', transition: 'background 0.25s, border-color 0.25s' }}>
      {/* Collapsed trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar name={user?.name ?? 'Guest'} src={user?.avatarUrl || null} />
        <button onClick={() => setExpanded(true)} style={{ flex: 1, textAlign: 'left', padding: '10px 16px', borderRadius: '24px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-muted)', fontSize: '14px', cursor: 'text', transition: 'border-color 0.15s, background 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--input-bg)'; }}>
          {user ? `What's on your mind, ${user.name.split(' ')[0]}?` : 'Share something with the community…'}
        </button>
      </div>

      {/* Quick type buttons */}
      {!expanded && (
        <div style={{ display: 'flex', gap: '4px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--divider)' }}>
          {POST_TYPES.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => { setType(value); setExpanded(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.12s, color 0.12s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* Expanded composer */}
      <AnimatePresence>
        {expanded && (
          <motion.form onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Type + Domain row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {POST_TYPES.map(({ value, label, icon: Icon }) => {
                  const active = type === value;
                  return (
                    <button key={value} type="button" onClick={() => setType(value)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: active ? '1.5px solid var(--accent-border)' : '1.5px solid var(--border)', background: active ? 'var(--accent-bg)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: active ? '600' : '400', cursor: 'pointer', transition: 'all 0.12s' }}>
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

              {/* Title */}
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title…" autoFocus required
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />

              {/* Body */}
              {type !== 'video' && (
                <textarea value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder={type === 'code' ? 'Brief description…' : 'Write your post…'} rows={3}
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              )}

              {/* Code */}
              {type === 'code' && (
                <textarea value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your code here…" rows={6}
                  style={{ padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--code-bg)', fontSize: '13px', color: 'var(--code-text)', lineHeight: '1.65', resize: 'vertical', outline: 'none', fontFamily: 'ui-monospace, Consolas, monospace', transition: 'border-color 0.15s' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              )}

              {/* Video */}
              {type === 'video' && (
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube or video URL…"
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-secondary)', outline: 'none', transition: 'border-color 0.15s' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              )}

              {/* Error */}
              {error && <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  <X size={13} /> Cancel
                </button>
                <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!title.trim() || submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: !title.trim() ? 'var(--accent-dim)' : 'var(--accent)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: title.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
                  {submitting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                  {submitting ? 'Posting…' : 'Post'}
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
