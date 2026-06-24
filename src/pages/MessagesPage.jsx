import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, ArrowLeft,
  UserCheck, UserX,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import api from '../api/axiosInstance';

/* ── helpers ── */
const avatarColor = (name) =>
  `hsl(${[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)`;
const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

function Avatar({ user, size = 38, showOnline = false, online = false }) {
  const s = { width: size, height: size, borderRadius: '50%', flexShrink: 0, position: 'relative' };
  const img = user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarColor(user.name), color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: '700', userSelect: 'none',
    }}>
      {initials(user.name)}
    </div>
  );

  return (
    <div style={s}>
      {img}
      {showOnline && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: 10, height: 10, borderRadius: '50%',
          background: online ? '#22c55e' : 'var(--text-muted)',
          border: '2px solid var(--card-bg)',
        }} />
      )}
    </div>
  );
}

/* ── Pending request row ── */
function PendingRow({ req, onAccept, onDecline }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '10px',
        background: 'var(--surface-2)', marginBottom: '6px',
      }}
    >
      <Link to={`/profile/${req.requester._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, textDecoration: 'none' }}>
        <Avatar user={req.requester} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}>
            {req.requester.name}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>sent you a friend request</p>
        </div>
      </Link>
      <button onClick={() => onAccept(req._id)} title="Accept" aria-label="Accept friend request"
        className="msg-icon-btn"
        style={{ width: 44, height: 44, borderRadius: '10px', border: 'none', background: 'var(--btn-grad)', color: '#fff', boxShadow: 'var(--btn-grad-shadow)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s, opacity 0.15s' }}>
        <UserCheck size={16} />
      </button>
      <button onClick={() => onDecline(req._id)} title="Decline" aria-label="Decline friend request"
        className="msg-icon-btn"
        style={{ width: 44, height: 44, borderRadius: '10px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s, border-color 0.15s, color 0.15s' }}>
        <UserX size={16} />
      </button>
    </motion.div>
  );
}

/* ── Chat window ── */
function ChatWindow({ friend, onBack }) {
  const { user } = useAuthStore();
  const { conversations, sendMessage, sendTyping, seedConversation, typingMap } = useSocketStore();
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const messages = conversations[friend._id] ?? [];
  const isTyping = typingMap[friend._id];

  // Load history
  useEffect(() => {
    setLoading(true);
    api.get(`/friends/messages/${friend._id}`)
      .then(({ data }) => seedConversation(friend._id, data.messages))
      .finally(() => setLoading(false));
  }, [friend._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(friend._id, text.trim());
    setText('');
    sendTyping(friend._id, false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    sendTyping(friend._id, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(friend._id, false), 1500);
  };

  const { isOnline } = useSocketStore();
  const online = isOnline(friend._id);

  const fmtTime = (d) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: 'var(--card-bg)', flexShrink: 0,
      }}>
        <button onClick={onBack} className="chat-back-btn" aria-label="Back to conversations"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', flexShrink: 0, transition: 'background 0.15s, color 0.15s' }}>
          <ArrowLeft size={18} />
        </button>
        <Link to={`/profile/${friend._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Avatar user={friend} size={36} showOnline online={online} />
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}>
              {friend.name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: online ? '#22c55e' : 'var(--text-muted)' }}>
              {online ? 'Online' : 'Offline'}
            </p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '6px',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '40px', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={28} style={{ opacity: 0.4 }} />
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === user._id || msg.sender?._id === user._id;
            return (
              <motion.div key={msg._id ?? i}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', minHeight: '44px', boxSizing: 'border-box',
                  padding: '12px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'var(--accent)' : 'var(--surface-2)',
                  color: isMe ? '#fff' : 'var(--text-primary)',
                  fontSize: '15px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <p style={{ margin: '3px 0 0', fontSize: '10px', opacity: 0.65, textAlign: 'right' }}>
                    {fmtTime(msg.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingLeft: '4px' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--card-bg)', display: 'flex', gap: '8px', flexShrink: 0,
      }}>
        <input
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${friend.name}…`}
          aria-label="Message input"
          style={{
            flex: 1, minHeight: '44px', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px',
            border: '1.5px solid var(--border)', background: 'var(--input-bg)',
            color: 'var(--text-primary)', fontSize: '16px', outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent-border)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
        <motion.button whileTap={{ scale: 0.93 }} onClick={handleSend} disabled={!text.trim()}
          aria-label="Send message"
          style={{
            width: 44, height: 44, borderRadius: '10px', border: 'none',
            background: text.trim() ? 'var(--btn-grad)' : 'var(--surface-2)',
            color: text.trim() ? '#fff' : 'var(--text-muted)',
            boxShadow: text.trim() ? 'var(--btn-grad-shadow)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s, color 0.15s',
            flexShrink: 0,
          }}>
          <Send size={16} />
        </motion.button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
        @media (min-width: 700px) { .chat-back-btn { display: none !important; } }
      `}</style>
    </div>
  );
}

/* ── Main Messages Page ── */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [friends, setFriends]   = useState([]);
  const [pending, setPending]   = useState([]);
  const [active, setActive]     = useState(null); // friend object currently chatting
  const [loading, setLoading]   = useState(true);

  const { isOnline } = useSocketStore();

  if (!user) { navigate('/'); return null; }

  const load = useCallback(async () => {
    setLoading(true);
    const [fr, pe] = await Promise.all([
      api.get('/friends'),
      api.get('/friends/pending'),
    ]);
    setFriends(fr.data.friends);
    setPending(pe.data.requests);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (requestId) => {
    await api.post(`/friends/accept/${requestId}`);
    load();
  };

  const handleDecline = async (requestId) => {
    await api.delete(`/friends/${requestId}`);
    load();
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)' }}>
      <Navbar />
      <div className="messages-grid" style={{
        maxWidth: '960px', margin: '0 auto', padding: '20px 16px',
        display: 'grid',
        gridTemplateColumns: active ? '300px 1fr' : '1fr',
        gap: '16px', height: 'calc(100svh - 80px)',
      }}>
        {/* Sidebar / friend list */}
        <div className="messages-sidebar" style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          ...(active ? {} : { maxWidth: '480px', margin: '0 auto', width: '100%' }),
        }}>
          <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid var(--divider)' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Messages
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {/* Pending requests */}
            {pending.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px 4px' }}>
                  Friend Requests ({pending.length})
                </p>
                <AnimatePresence>
                  {pending.map((req) => (
                    <PendingRow key={req._id} req={req}
                      onAccept={handleAccept} onDecline={handleDecline} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Friends list */}
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px 4px' }}>
              Friends {loading ? '' : `(${friends.length})`}
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Loading…
              </div>
            ) : friends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <MessageSquare size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p style={{ margin: 0 }}>No friends yet. Search for people to connect!</p>
              </div>
            ) : (
              friends.map((f) => {
                const online = isOnline(f._id);
                const isActive = active?._id === f._id;
                return (
                  <motion.div key={f._id} whileHover={{ background: 'var(--hover-bg)' }}
                    onClick={() => setActive(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(f); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px',
                      padding: '10px', borderRadius: '10px', cursor: 'pointer',
                      background: isActive ? 'var(--accent-dim)' : 'transparent',
                      transition: 'background 0.12s',
                    }}>
                    <Avatar user={f} size={40} showOnline online={online} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: online ? '#22c55e' : 'var(--text-muted)' }}>
                        {online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        {active && (
          <div className="messages-thread" style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            <ChatWindow friend={active} onBack={() => setActive(null)} />
          </div>
        )}
      </div>

      <style>{`
        /* Mobile: single-pane — show only the active pane (list or thread) */
        @media (max-width: 699px) {
          .messages-grid { grid-template-columns: 1fr !important; padding: 12px !important; }
          .messages-grid:has(.messages-thread) .messages-sidebar { display: none !important; }
        }
        button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
