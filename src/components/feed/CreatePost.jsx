import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Code2, Video, Send, X, Loader2, Users2, Plus, Handshake } from 'lucide-react';
import MembersSlider from './MembersSlider';
import Button from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { DOMAINS } from '../../data/mockPosts';
import { queryClient } from '../../api/queryClient';
import api from '../../api/axiosInstance';

const COLLAB_COLOR = '#6366f1';

function Avatar({ name, src, size = 38 }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const hue = [...(name ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />;
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-semibold shrink-0">
      {initials}
    </div>
  );
}

const POST_TYPES = [
  { value: 'text',   label: 'Text',   icon: Type   },
  { value: 'code',   label: 'Code',   icon: Code2  },
  // { value: 'video',  label: 'Video',  icon: Video  },
  { value: 'collab', label: 'Collab', icon: Handshake },
];

const PRESET_ROLES = ['Frontend Dev', 'Backend Dev', 'Full Stack', 'Designer', 'DevOps', 'ML Engineer', 'Mobile Dev', 'QA'];

const fieldBase = 'rounded-[10px] border-[1.5px] border-border bg-input outline-none transition-colors duration-150';

function TagInput({ tags, onAdd, onRemove, placeholder, presets }) {
  const [input, setInput] = useState('');

  const add = (val) => {
    const v = val.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Preset chips */}
      {presets && (
        <div className="flex flex-wrap gap-[5px]">
          {presets.filter((p) => !tags.includes(p)).map((p) => (
            <button
              key={p} type="button" onClick={() => onAdd(p)}
              className="px-2.5 py-[3px] rounded-full text-xs cursor-pointer flex items-center gap-[3px]"
              style={{ border: `1px solid ${COLLAB_COLOR}40`, background: `${COLLAB_COLOR}0d`, color: COLLAB_COLOR }}
            >
              <Plus size={10} /> {p}
            </button>
          ))}
        </div>
      )}
      {/* Added tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-[5px]">
          {tags.map((t) => (
            <span key={t} className="px-2.5 py-[3px] rounded-full text-white text-xs font-medium flex items-center gap-1" style={{ background: COLLAB_COLOR }}>
              {t}
              <button type="button" onClick={() => onRemove(t)} className="bg-none border-none cursor-pointer text-white/80 leading-none p-0 text-sm">×</button>
            </span>
          ))}
        </div>
      )}
      {/* Free-form input (tech stack only, no presets) */}
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

export default function CreatePost({ onOpenModal }) {
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

  const handleOpen = (selectedType = 'text') => {
    if (onOpenModal) {
      onOpenModal(selectedType);
    } else {
      setType(selectedType);
      setExpanded(true);
    }
  };

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
    <div
      className="bg-card rounded-[14px] px-5 py-4 shadow-sm transition-colors duration-250 border border-card-border"
    >
      {/* Collapsed trigger */}
      <div className="flex items-center gap-3">
        <Avatar name={user?.name ?? 'Guest'} src={user?.avatarUrl || null} />
        <button
          onClick={() => handleOpen('text')}
          className="flex-1 text-left px-4 py-2.5 rounded-3xl border-[1.5px] border-border bg-input text-text-muted text-sm cursor-text transition-colors duration-150 hover:border-accent-border hover:bg-card"
        >
          {user ? `What's on your mind, ${user.name.split(' ')[0]}?` : 'Share something with the community…'}
        </button>
      </div>

      {/* Quick type buttons */}
      {!expanded && (
        <div className="flex gap-1 mt-3 pt-3 border-t border-divider">
          {POST_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value} onClick={() => handleOpen(value)}
              className={[
                'flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg border-none bg-transparent text-[13px] cursor-pointer',
                'transition-colors duration-120 hover:bg-hover',
                value === 'collab' ? 'font-semibold' : 'font-medium',
              ].join(' ')}
              style={{ color: value === 'collab' ? COLLAB_COLOR : 'var(--text-secondary)' }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* Expanded composer */}
      <AnimatePresence>
        {expanded && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden"
          >
            <div className="pt-4 flex flex-col gap-3">

              {/* Type + Domain row */}
              <div className="flex gap-2 flex-wrap items-center">
                {POST_TYPES.map(({ value, label, icon: Icon }) => {
                  const active = type === value;
                  const color  = value === 'collab' ? COLLAB_COLOR : 'var(--accent)';
                  return (
                    <button
                      key={value} type="button" onClick={() => setType(value)}
                      className={`flex items-center gap-[5px] px-3 py-1.5 rounded-lg text-[13px] cursor-pointer transition-all duration-120 ${active ? 'font-semibold' : 'font-normal'}`}
                      style={{
                        border: active ? `1.5px solid ${color}60` : '1.5px solid var(--border)',
                        background: active ? `${value === 'collab' ? COLLAB_COLOR : 'var(--accent-dim)'}` : 'transparent',
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

              {/* ── Collab-specific fields ── */}
              {isCollab && (
                <>
                  <div
                    className="px-3.5 py-3 rounded-[10px] flex items-center gap-2"
                    style={{ background: `${COLLAB_COLOR}0d`, border: `1px solid ${COLLAB_COLOR}30` }}
                  >
                    <Users2 size={15} color={COLLAB_COLOR} />
                    <span className="text-[13px] font-semibold" style={{ color: COLLAB_COLOR }}>Collab Post — looking for collaborators</span>
                  </div>

                  <input
                    value={projectName} onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name (optional)"
                    className={`${fieldBase} px-3.5 py-2.5 text-sm text-text-primary focus:border-[#3a3d4a]`}
                  />
                </>
              )}

              {/* Title */}
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={isCollab ? 'What are you building? What help do you need?' : 'Post title…'}
                autoFocus required
                className={`${fieldBase} px-3.5 py-2.5 text-[15px] font-medium text-text-primary ${isCollab ? 'focus:border-[#3a3d4a]' : 'focus:border-accent-border'}`}
              />

              {/* Body */}
              {type !== 'video' && (
                <textarea
                  value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder={isCollab ? 'Describe the project, what stage it\'s at, and what you\'re looking for…' : type === 'code' ? 'Brief description…' : 'Write your post…'}
                  rows={isCollab ? 4 : 3}
                  className={`${fieldBase} px-3.5 py-2.5 text-sm text-text-secondary leading-relaxed resize-y font-[inherit] ${isCollab ? 'focus:border-[#3a3d4a]' : 'focus:border-accent-border'}`}
                />
              )}

              {/* Code */}
              {type === 'code' && (
                <textarea
                  value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your code here…" rows={6}
                  className="px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-code-bg text-[13px] text-code-text leading-[1.65] resize-y outline-none font-mono transition-colors duration-150 focus:border-accent-border"
                />
              )}

              {/* Video */}
              {type === 'video' && (
                <input
                  value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube or video URL…"
                  className={`${fieldBase} px-3.5 py-2.5 text-sm text-text-secondary focus:border-accent-border`}
                />
              )}

              {/* ── Collab: tech stack + roles ── */}
              {isCollab && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.06em] mb-2">Tech Stack</p>
                    <TagInput tags={techStack} onAdd={(t) => setTechStack((s) => [...s, t])} onRemove={(t) => setTechStack((s) => s.filter((x) => x !== t))} placeholder="Type a tech and press Enter (e.g. React, Node.js)" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.06em] mb-2">Roles Needed</p>
                    <TagInput tags={rolesNeeded} onAdd={(r) => setRolesNeeded((s) => [...s, r])} onRemove={(r) => setRolesNeeded((s) => s.filter((x) => x !== r))} presets={PRESET_ROLES} />
                  </div>
                  <MembersSlider value={membersNeeded} onChange={setMembersNeeded} />
                </>
              )}

              {error && <p className="text-[13px] text-error m-0">{error}</p>}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={close}>
                  <X size={13} /> Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={submitting} disabled={!title.trim() || submitting}>
                  {!submitting && (isCollab ? <Users2 size={13} /> : <Send size={13} />)}
                  {submitting ? 'Posting…' : isCollab ? 'Post Collab' : 'Post'}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
