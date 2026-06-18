import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Code2, Video, Send, X, Loader2, Users2, Plus } from 'lucide-react';
import MembersSlider from './MembersSlider';
import { useAuthStore } from '../../stores/authStore';
import { DOMAINS } from '../../data/mockPosts';
import { queryClient } from '../../api/queryClient';
import api from '../../api/axiosInstance';

const COLLAB_COLOR = '#0891b2';

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
  { value: 'text',   label: 'Text',   icon: Type   },
  { value: 'code',   label: 'Code',   icon: Code2  },
  { value: 'video',  label: 'Video',  icon: Video  },
  { value: 'collab', label: 'Collab', icon: Users2 },
];

const PRESET_ROLES = ['Frontend Dev', 'Backend Dev', 'Full Stack', 'Designer', 'DevOps', 'ML Engineer', 'Mobile Dev', 'QA'];

function TagInput({ tags, onAdd, onRemove, placeholder, presets }) {
  const [input, setInput] = useState('');

  const add = (val) => {
    const v = val.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Preset chips */}
      {presets && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {presets.filter((p) => !tags.includes(p)).map((p) => (
            <button key={p} type="button" onClick={() => onAdd(p)}
              style={{ padding: '3px 10px', borderRadius: '20px', border: `1px solid ${COLLAB_COLOR}40`, background: `${COLLAB_COLOR}0d`, color: COLLAB_COLOR, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Plus size={10} /> {p}
            </button>
          ))}
        </div>
      )}
      {/* Added tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {tags.map((t) => (
            <span key={t} style={{ padding: '3px 10px', borderRadius: '20px', background: COLLAB_COLOR, color: '#fff', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t}
              <button type="button" onClick={() => onRemove(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', lineHeight: 1, padding: 0, fontSize: '14px' }}>×</button>
            </span>
          ))}
        </div>
      )}
      {/* Free-form input (tech stack only, no presets) */}
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

export default function CreatePost() {
  const { user } = useAuthStore();
  const [expanded, setExpanded]     = useState(false);
  const [type, setType]             = useState('text');
  const [domain, setDomain]         = useState('webdev');
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [code, setCode]             = useState('');
  const [videoUrl, setVideoUrl]     = useState('');
  // Collab-specific
  const [projectName,   setProjectName]   = useState('');
  const [techStack,     setTechStack]     = useState([]);
  const [rolesNeeded,   setRolesNeeded]   = useState([]);
  const [membersNeeded, setMembersNeeded] = useState(3);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const close = () => {
    setExpanded(false);
    setTitle(''); setBody(''); setCode(''); setVideoUrl('');
    setProjectName(''); setTechStack([]); setRolesNeeded([]); setMembersNeeded(3);
    setType('text'); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true); setError('');
    try {
      await api.post('/posts', {
        type, domain, title: title.trim(),
        body:        body.trim(),
        codeSnippet: code.trim(),
        language:    'javascript',
        videoUrl:    videoUrl.trim(),
        projectName: projectName.trim(),
        techStack,
        rolesNeeded,
        membersNeeded,
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      close();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCollab = type === 'collab';

  return (
    <div style={{
      background: 'var(--card-bg)', border: `1px solid ${isCollab && expanded ? COLLAB_COLOR + '40' : 'var(--card-border)'}`,
      borderRadius: '14px', padding: '16px 20px', boxShadow: 'var(--shadow-sm)',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      {/* Collapsed trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Avatar name={user?.name ?? 'Guest'} src={user?.avatarUrl || null} />
        <button onClick={() => setExpanded(true)}
          style={{ flex: 1, textAlign: 'left', padding: '10px 16px', borderRadius: '24px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-muted)', fontSize: '14px', cursor: 'text', transition: 'border-color 0.15s, background 0.15s' }}
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
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'transparent',
                color: value === 'collab' ? COLLAB_COLOR : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: value === 'collab' ? '600' : '500',
                cursor: 'pointer', transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {POST_TYPES.map(({ value, label, icon: Icon }) => {
                  const active = type === value;
                  const color  = value === 'collab' ? COLLAB_COLOR : 'var(--accent)';
                  return (
                    <button key={value} type="button" onClick={() => setType(value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '8px',
                        border: active ? `1.5px solid ${color}60` : '1.5px solid var(--border)',
                        background: active ? `${value === 'collab' ? COLLAB_COLOR : 'var(--accent-dim)'}` : 'transparent',
                        color: active ? (value === 'collab' ? '#fff' : 'var(--accent)') : 'var(--text-secondary)',
                        fontSize: '13px', fontWeight: active ? '600' : '400', cursor: 'pointer', transition: 'all 0.12s',
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

              {/* ── Collab-specific fields ── */}
              {isCollab && (
                <>
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: `${COLLAB_COLOR}0d`, border: `1px solid ${COLLAB_COLOR}30`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users2 size={15} color={COLLAB_COLOR} />
                    <span style={{ fontSize: '13px', color: COLLAB_COLOR, fontWeight: '600' }}>Collab Post — looking for collaborators</span>
                  </div>

                  <input value={projectName} onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name (optional)"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
                    onFocus={(e) => (e.target.style.borderColor = COLLAB_COLOR)}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                </>
              )}

              {/* Title */}
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={isCollab ? 'What are you building? What help do you need?' : 'Post title…'}
                autoFocus required
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={(e) => (e.target.style.borderColor = isCollab ? COLLAB_COLOR : 'var(--accent-border)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />

              {/* Body */}
              {type !== 'video' && (
                <textarea value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder={isCollab ? 'Describe the project, what stage it\'s at, and what you\'re looking for…' : type === 'code' ? 'Brief description…' : 'Write your post…'}
                  rows={isCollab ? 4 : 3}
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                  onFocus={(e) => (e.target.style.borderColor = isCollab ? COLLAB_COLOR : 'var(--accent-border)')}
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

              {/* ── Collab: tech stack + roles ── */}
              {isCollab && (
                <>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Tech Stack</p>
                    <TagInput tags={techStack} onAdd={(t) => setTechStack((s) => [...s, t])} onRemove={(t) => setTechStack((s) => s.filter((x) => x !== t))} placeholder="Type a tech and press Enter (e.g. React, Node.js)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Roles Needed</p>
                    <TagInput tags={rolesNeeded} onAdd={(r) => setRolesNeeded((s) => [...s, r])} onRemove={(r) => setRolesNeeded((s) => s.filter((x) => x !== r))} presets={PRESET_ROLES} />
                  </div>
                  <MembersSlider value={membersNeeded} onChange={setMembersNeeded} />
                </>
              )}

              {error && <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</p>}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={close}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  <X size={13} /> Cancel
                </button>
                <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!title.trim() || submitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', border: 'none',
                    background: !title.trim() ? 'var(--accent-dim)' : isCollab ? COLLAB_COLOR : 'var(--accent)',
                    color: '#fff', fontSize: '13px', fontWeight: '600',
                    cursor: title.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
                  }}>
                  {submitting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : isCollab ? <Users2 size={13} /> : <Send size={13} />}
                  {submitting ? 'Posting…' : isCollab ? 'Post Collab' : 'Post'}
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
