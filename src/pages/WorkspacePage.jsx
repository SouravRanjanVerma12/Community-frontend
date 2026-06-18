import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, LayoutDashboard, CheckSquare, Users, MessageSquare,
  BookOpen, Plus, Trash2, Send, ExternalLink, Loader2,
  Code, Palette, FileText, Globe, Link2,
  CheckCircle, Clock, Circle, Wifi, WifiOff,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axiosInstance';
import { useAuthStore } from '../stores/authStore';
import { getSocket, useSocketStore } from '../stores/socketStore';

/* ── shared helpers ── */
const CC = '#0891b2';

function Avatar({ name, src, size = 32 }) {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700', border: '2px solid var(--border)', flexShrink: 0 }}>{initials}</div>;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

const RESOURCE_ICONS = {
  github: { icon: Code,     color: '#1a1a1a', label: 'GitHub'  },
  figma:  { icon: Palette,  color: '#a259ff', label: 'Figma'   },
  docs:   { icon: FileText, color: '#2563eb', label: 'Docs'    },
  deploy: { icon: Globe,    color: '#059669', label: 'Deploy'  },
  other:  { icon: Link2,    color: '#6b7280', label: 'Link'    },
};

/* ── Overview section ── */
function Overview({ postId, isOwner }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/workspace/${postId}/overview`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <Loader />;
  if (!data) return null;

  const { post, taskStats, memberCount, msgCount, recentResources } = data;
  const totalTasks = taskStats.todo + taskStats.in_progress + taskStats.done;
  const progress   = totalTasks > 0 ? Math.round((taskStats.done / totalTasks) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Project info card */}
      <div style={{ background: 'var(--card-bg)', border: `1px solid ${CC}28`, borderRadius: '14px', padding: '22px 24px' }}>
        {post.projectName && <p style={{ fontSize: '12px', fontWeight: '700', color: CC, marginBottom: '6px' }}>🚀 {post.projectName}</p>}
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>{post.title}</h2>
        {post.body && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '14px' }}>{post.body}</p>}
        {post.techStack?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {post.techStack.map(t => <span key={t} style={{ padding: '3px 10px', borderRadius: '6px', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--mono)' }}>{t}</span>)}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { icon: Users,        label: 'Members',     val: memberCount,          color: CC          },
          { icon: CheckSquare,  label: 'Total Tasks',  val: totalTasks,           color: '#d97706'   },
          { icon: CheckCircle,  label: 'Done',         val: taskStats.done,       color: '#16a34a'   },
          { icon: MessageSquare,label: 'Messages',     val: msgCount,             color: '#8b5cf6'   },
        ].map(({ icon: Icon, label, val, color }) => (
          <div key={label} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Icon size={18} color={color} />
            <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{val}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Task progress */}
      {totalTasks > 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Project Progress</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: CC }}>{progress}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'var(--surface-2)', overflow: 'hidden', marginBottom: '10px' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: progress === 100 ? '#16a34a' : CC, borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[['To Do', taskStats.todo, '#6b7280'], ['In Progress', taskStats.in_progress, '#d97706'], ['Done', taskStats.done, '#16a34a']].map(([label, val, color]) => (
              <span key={label} style={{ fontSize: '12px', color, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {label}: {val}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent resources */}
      {recentResources?.length > 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '18px 20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Recent Resources</p>
          {recentResources.map(r => {
            const { icon: Icon, color } = RESOURCE_ICONS[r.type] ?? RESOURCE_ICONS.other;
            return (
              <a key={r._id} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--divider)', textDecoration: 'none' }}>
                <Icon size={15} color={color} />
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500', flex: 1 }}>{r.title}</span>
                <ExternalLink size={12} color="var(--text-muted)" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Members section ── */
function Members({ postId, isOwner }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/workspace/${postId}/members`).then(r => setMembers(r.data.members)).finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{members.length} team member{members.length !== 1 ? 's' : ''}</p>
      {members.map(({ user, role, joinedAt }) => (
        <div key={user._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to={`/profile/${user._id}`} style={{ flexShrink: 0 }}><Avatar name={user.name} src={user.avatarUrl} size={42} /></Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link to={`/profile/${user._id}`} style={{ textDecoration: 'none' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{user.name}</p>
            </Link>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user.username} · joined {timeAgo(joinedAt)}</p>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: role === 'Lead' ? `${CC}14` : 'rgba(34,197,94,0.1)', color: role === 'Lead' ? CC : '#16a34a', flexShrink: 0 }}>
            {role}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Discussion section — real-time via Socket.io ── */
function Discussion({ postId, isOwner }) {
  const { user }    = useAuthStore();
  const connected   = useSocketStore((s) => s.connected);

  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [text,      setText]      = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  /* Load history + join socket room */
  useEffect(() => {
    api.get(`/workspace/${postId}/messages`)
      .then(r => setMessages(r.data.messages))
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (!socket) return;

    socket.emit('project:join', { postId });

    const onMsg = (msg) => {
      setMessages(prev => {
        // deduplicate by _id (in case REST and socket race)
        if (prev.some(m => m._id?.toString() === msg._id?.toString())) return prev;
        return [...prev, msg];
      });
    };

    const onTyping = ({ userId: uid, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        isTyping ? next.add(uid) : next.delete(uid);
        return next;
      });
    };

    socket.on('project:message:receive', onMsg);
    socket.on('project:typing',          onTyping);

    return () => {
      socket.emit('project:leave', { postId });
      socket.off('project:message:receive', onMsg);
      socket.off('project:typing',          onTyping);
    };
  }, [postId]);

  /* Auto-scroll on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  /* Send via socket (socket broadcasts to room + backend persists) */
  const send = () => {
    if (!text.trim()) return;
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('project:message', { postId, text: text.trim() });
    } else {
      // Fallback: REST if socket not connected
      api.post(`/workspace/${postId}/messages`, { text: text.trim() })
        .then(r => setMessages(prev => [...prev, r.data.message]));
    }
    setText('');
    clearTimeout(typingTimer.current);
    socket?.emit('project:typing', { postId, isTyping: false });
  };

  /* Typing indicator */
  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit('project:typing', { postId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('project:typing', { postId, isTyping: false });
    }, 1500);
  };

  if (loading) return <Loader />;

  const othersTyping = typingUsers.size > 0 && !typingUsers.has(user?._id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: '400px' }}>

      {/* Connection status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', padding: '6px 12px', borderRadius: '8px', background: connected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, width: 'fit-content' }}>
        {connected ? <Wifi size={13} color="#16a34a" /> : <WifiOff size={13} color="#dc2626" />}
        <span style={{ fontSize: '12px', fontWeight: '600', color: connected ? '#16a34a' : '#dc2626' }}>
          {connected ? 'Live — messages appear instantly' : 'Offline — reconnecting…'}
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>No messages yet. Start the discussion!</p>
          </div>
        ) : messages.map((msg, i) => {
          const isMe       = msg.author._id === user?._id || msg.author === user?._id;
          const prevAuthor = messages[i - 1]?.author?._id ?? messages[i - 1]?.author;
          const thisAuthor = msg.author?._id ?? msg.author;
          const showMeta   = i === 0 || prevAuthor !== thisAuthor;

          return (
            <motion.div key={msg._id ?? i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
              style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexDirection: isMe ? 'row-reverse' : 'row', marginTop: showMeta ? '8px' : '0' }}>
              {showMeta
                ? <Avatar name={msg.author?.name} src={msg.author?.avatarUrl} size={28} />
                : <div style={{ width: 28, flexShrink: 0 }} />}
              <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '2px' }}>
                {showMeta && !isMe && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '4px' }}>
                    {msg.author?.name}
                  </span>
                )}
                <div style={{
                  padding: '9px 13px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? CC : 'var(--surface-2)',
                  color: isMe ? '#fff' : 'var(--text-primary)',
                  fontSize: '14px', lineHeight: '1.5',
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px', marginRight: '4px' }}>
                  {timeAgo(msg.createdAt)}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {othersTyping && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '36px' }}>
              <div style={{ display: 'flex', gap: '3px', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>typing…</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input — owner only */}
      {isOwner ? (
        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <input value={text} onChange={handleTyping}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={connected ? 'Type a message… (Enter to send)' : 'Reconnecting…'}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = CC)}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          <motion.button whileTap={{ scale: 0.95 }} onClick={send} disabled={!text.trim()}
            style={{ width: 42, height: 42, borderRadius: '10px', border: 'none', background: text.trim() ? CC : 'var(--surface-2)', color: text.trim() ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, boxShadow: text.trim() ? `0 4px 12px ${CC}40` : 'none', transition: 'all 0.15s' }}>
            <Send size={16} />
          </motion.button>
        </div>
      ) : (
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '12px' }}>
          👁 You can read discussion — only the project owner can post messages
        </div>
      )}
    </div>
  );
}

/* ── Resources section ── */
function Resources({ postId, isOwner }) {
  const [resources, setResources] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [form,      setForm]      = useState({ title: '', url: '', type: 'other' });
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    api.get(`/workspace/${postId}/resources`).then(r => setResources(r.data.resources)).finally(() => setLoading(false));
  }, [postId]);

  const add = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/workspace/${postId}/resources`, form);
      setResources(prev => [data.resource, ...prev]);
      setForm({ title: '', url: '', type: 'other' }); setAdding(false);
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    await api.delete(`/workspace/${postId}/resources/${id}`);
    setResources(prev => prev.filter(r => r._id !== id));
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {isOwner && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setAdding(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', border: 'none', background: adding ? 'var(--surface-2)' : CC, color: adding ? 'var(--text-secondary)' : '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={14} /> {adding ? 'Cancel' : 'Add Resource'}
          </button>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ background: 'var(--card-bg)', border: `1.5px solid ${CC}35`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Resource name"
                  style={{ flex: 1, minWidth: '160px', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }} />
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '13px', color: 'var(--text-secondary)', outline: 'none', cursor: 'pointer' }}>
                  <option value="github">GitHub</option>
                  <option value="figma">Figma</option>
                  <option value="docs">Docs</option>
                  <option value="deploy">Deploy</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://…"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={add} disabled={!form.title.trim() || !form.url.trim() || saving}
                style={{ alignSelf: 'flex-end', padding: '8px 18px', borderRadius: '8px', border: 'none', background: CC, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resource list */}
      {resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <BookOpen size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ fontSize: '14px' }}>No resources yet. Add your GitHub repo, design file, or docs.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {resources.map(r => {
            const { icon: Icon, color, label } = RESOURCE_ICONS[r.type] ?? RESOURCE_ICONS.other;
            return (
              <div key={r._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{r.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</p>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', background: `${color}12`, color, flexShrink: 0 }}>{label}</span>
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
                  <ExternalLink size={15} />
                </a>
                {isOwner && (
                  <button onClick={() => remove(r._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0, padding: '2px' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Loader ── */
function Loader() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader2 size={24} color={CC} style={{ animation: 'spin 0.8s linear infinite' }} /></div>;
}

/* ── Sidebar nav item ── */
const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'tasks',       label: 'Tasks',       icon: CheckSquare     },
  { id: 'members',     label: 'Members',     icon: Users           },
  { id: 'discussion',  label: 'Discussion',  icon: MessageSquare   },
  { id: 'resources',   label: 'Resources',   icon: BookOpen        },
];

/* ── Task board (inline) ── */
const STATUSES = [
  { id: 'todo',        label: 'To Do',      color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress', color: '#d97706' },
  { id: 'done',        label: 'Done',        color: '#16a34a' },
];
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

function Tasks({ postId, isOwner }) {
  const [tasks,        setTasks]        = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [addingStatus, setAddingStatus] = useState(null);
  const [newTitle,     setNewTitle]     = useState('');
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    api.get(`/posts/${postId}/tasks`).then(r => { setTasks(r.data.tasks); if (r.data.tasks.length) setSelected(r.data.tasks[0]); }).finally(() => setLoading(false));
  }, [postId]);

  const refresh = async () => {
    const { data } = await api.get(`/posts/${postId}/tasks`);
    setTasks(data.tasks);
    if (selected) setSelected(data.tasks.find(t => t._id === selected._id) ?? null);
  };

  const patch = async (taskId, updates) => {
    const { data } = await api.patch(`/tasks/${taskId}`, updates);
    setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    if (selected?._id === taskId) setSelected(data.task);
  };

  const addTask = async (status) => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try { await api.post(`/posts/${postId}/tasks`, { title: newTitle.trim(), status }); setNewTitle(''); setAddingStatus(null); await refresh(); }
    finally { setSaving(false); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const toggleChecklist = async (idx) => {
    const updated = selected.checklist.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item);
    await patch(selected._id, { checklist: updated });
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', alignItems: 'flex-start', paddingBottom: '12px' }}>
      {STATUSES.map(({ id: status, label, color }) => {
        const colTasks = tasks.filter(t => t.status === status);
        return (
          <div key={status} style={{ width: '260px', flexShrink: 0, background: 'var(--surface-2)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--surface-3)', padding: '0 5px', borderRadius: '8px' }}>{colTasks.length}</span>
              </div>
            </div>
            {colTasks.map(task => (
              <div key={task._id} onClick={() => setSelected(task)}
                style={{ background: 'var(--card-bg)', borderRadius: '8px', padding: '10px', border: selected?._id === task._id ? `1.5px solid ${CC}` : '1px solid var(--card-border)', cursor: 'pointer', boxShadow: selected?._id === task._id ? `0 0 0 3px ${CC}15` : 'none' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.4' }}>{task.title}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: `${PRIORITY_COLORS[task.priority]}15`, color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                  {task.checklist?.length > 0 && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>✓ {task.checklist.filter(i => i.completed).length}/{task.checklist.length}</span>}
                </div>
              </div>
            ))}
            {isOwner && (
              <>
                <AnimatePresence>
                  {addingStatus === status && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--card-bg)', borderRadius: '8px', padding: '8px', border: `1.5px solid ${CC}` }}>
                      <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addTask(status); if (e.key === 'Escape') setAddingStatus(null); }}
                        placeholder="Task title…" style={{ padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border)', background: 'var(--input-bg)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => addTask(status)} style={{ flex: 1, padding: '4px', borderRadius: '5px', border: 'none', background: CC, color: '#fff', fontSize: '11px', cursor: 'pointer' }}>{saving ? '…' : 'Add'}</button>
                        <button onClick={() => setAddingStatus(null)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => { setAddingStatus(status); setNewTitle(''); }}
                  style={{ width: '100%', padding: '7px', borderRadius: '7px', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Plus size={11} /> Add task
                </button>
              </>
            )}
          </div>
        );
      })}

      {/* Detail panel */}
      {selected && (
        <div style={{ width: '280px', flexShrink: 0, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>

          {/* View-only banner for members */}
          {!isOwner && (
            <div style={{ padding: '7px 10px', borderRadius: '7px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11px', color: '#d97706', fontWeight: '600' }}>
              👁 View only — only the owner can edit tasks
            </div>
          )}

          {/* Title: editable for owner, read-only for member */}
          {isOwner ? (
            <input value={selected.title} onChange={e => setSelected(s => ({ ...s, title: e.target.value }))}
              onBlur={() => patch(selected._id, { title: selected.title })}
              style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }} />
          ) : (
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: 0 }}>{selected.title}</p>
          )}

          {/* Status */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {STATUSES.map(s => (
              <button key={s.id} onClick={() => isOwner && patch(selected._id, { status: s.id })}
                style={{ padding: '4px 10px', borderRadius: '20px', border: `1.5px solid ${selected.status === s.id ? s.color : 'var(--border)'}`, background: selected.status === s.id ? `${s.color}14` : 'transparent', color: selected.status === s.id ? s.color : 'var(--text-secondary)', fontSize: '11px', fontWeight: selected.status === s.id ? '700' : '400', cursor: isOwner ? 'pointer' : 'default', opacity: !isOwner && selected.status !== s.id ? 0.5 : 1 }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Due date */}
          {isOwner ? (
            <input type="date" value={selected.dueDate?.slice(0, 10) ?? ''} onChange={e => patch(selected._id, { dueDate: e.target.value || null })}
              style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid var(--border)', background: 'var(--input-bg)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }} />
          ) : selected.dueDate ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>📅 Due {new Date(selected.dueDate).toLocaleDateString()}</p>
          ) : null}

          {/* Checklist */}
          {selected.checklist?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selected.checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: isOwner ? 'pointer' : 'default' }}
                  onClick={() => isOwner && toggleChecklist(idx)}>
                  {item.completed ? <CheckCircle size={15} color="#16a34a" /> : <Circle size={15} color="var(--text-muted)" />}
                  <span style={{ fontSize: '12px', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Owner-only actions */}
          {isOwner && (
            <>
              <button onClick={() => patch(selected._id, { checklist: [...(selected.checklist ?? []), { text: 'New item', completed: false }] })}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px', borderRadius: '7px', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}>
                <Plus size={11} /> Add checklist item
              </button>
              <button onClick={() => deleteTask(selected._id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#dc2626', fontSize: '12px', cursor: 'pointer' }}>
                <Trash2 size={12} /> Delete task
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main workspace page ── */
export default function WorkspacePage() {
  const { id: postId } = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuthStore();
  const [section,   setSection]   = useState('overview');
  const [postTitle, setPostTitle] = useState('Workspace');
  const [isOwner,   setIsOwner]   = useState(false);
  const [roleReady, setRoleReady] = useState(false);

  useEffect(() => {
    api.get(`/workspace/${postId}/overview`)
      .then(r => {
        const post = r.data.post;
        setPostTitle(post?.projectName || post?.title || 'Workspace');
        // Compare author id with current user id
        const authorId = post?.author?._id ?? post?.author;
        setIsOwner(String(authorId) === String(user?._id));
      })
      .catch(() => {})
      .finally(() => setRoleReady(true));
  }, [postId, user?._id]);

  const renderSection = () => {
    switch (section) {
      case 'overview':   return <Overview   postId={postId} isOwner={isOwner} />;
      case 'tasks':      return <Tasks      postId={postId} isOwner={isOwner} />;
      case 'members':    return <Members    postId={postId} isOwner={isOwner} />;
      case 'discussion': return <Discussion postId={postId} isOwner={isOwner} />;
      case 'resources':  return <Resources  postId={postId} isOwner={isOwner} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: '220px', flexShrink: 0, background: 'var(--card-bg)', borderRight: '1px solid var(--border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '60px', height: 'calc(100svh - 60px)', overflowY: 'auto' }}>
          {/* Back */}
          <button onClick={() => navigate('/collab')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', marginBottom: '8px', textAlign: 'left' }}>
            <ArrowLeft size={13} /> Collab Hub
          </button>

          {/* Project name + role */}
          <div style={{ padding: '10px 10px 14px', borderBottom: '1px solid var(--divider)', marginBottom: '8px' }}>
            <p style={{ fontSize: '12px', color: CC, fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3', marginBottom: '8px' }}>{postTitle}</p>
            {roleReady && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                background: isOwner ? `${CC}18` : 'rgba(34,197,94,0.1)',
                color: isOwner ? CC : '#16a34a',
                border: `1px solid ${isOwner ? CC + '35' : 'rgba(34,197,94,0.25)'}`,
              }}>
                {isOwner ? '👑 Owner' : '👤 Member'}
              </span>
            )}
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <motion.button key={id} onClick={() => setSection(id)} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '9px', border: 'none',
                  background: active ? `${CC}14` : 'transparent',
                  color: active ? CC : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: active ? '700' : '500',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 0.12s, color 0.12s',
                }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
                {active && <motion.div layoutId="sidebar-indicator" style={{ position: 'absolute', left: 0, width: '3px', height: '28px', background: CC, borderRadius: '0 2px 2px 0' }} />}
              </motion.button>
            );
          })}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowX: 'auto' }}>
          <div style={{ maxWidth: section === 'tasks' ? 'none' : '800px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '20px', letterSpacing: '-0.3px' }}>
              {NAV_ITEMS.find(n => n.id === section)?.label}
            </h1>
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
