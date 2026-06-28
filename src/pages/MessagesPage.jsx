import { useState, useEffect, useRef } from 'react';
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
import { useFriends, usePendingRequests, invalidateFriends } from '../hooks/useFriends';

/* ── helpers ── */
const avatarColor = (name) =>
  `hsl(${[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)`;
const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

function Avatar({ user, size = 38, showOnline = false, online = false }) {
  const img = user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.name} style={{ width: size, height: size }} className="rounded-full object-cover block" />
  ) : (
    <div style={{ width: size, height: size, background: avatarColor(user.name), fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold select-none">
      {initials(user.name)}
    </div>
  );

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      {img}
      {showOnline && (
        <span
          className="absolute bottom-px right-px w-2.5 h-2.5 rounded-full border-2 border-card"
          style={{ background: online ? '#22c55e' : 'var(--text-muted)' }}
        />
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
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-surface-2 mb-1.5"
    >
      <Link to={`/profile/${req.requester._id}`} className="flex items-center gap-2.5 flex-1 min-w-0 no-underline">
        <Avatar user={req.requester} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary m-0 overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-150 hover:text-accent">
            {req.requester.name}
          </p>
          <p className="text-xs text-text-muted m-0">sent you a friend request</p>
        </div>
      </Link>
      <button
        onClick={() => onAccept(req._id)} title="Accept" aria-label="Accept friend request"
        className="w-11 h-11 rounded-[10px] border-none bg-(image:--btn-grad) text-white shadow-btn text-xs font-semibold cursor-pointer flex items-center justify-center shrink-0 transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-95"
      >
        <UserCheck size={16} />
      </button>
      <button
        onClick={() => onDecline(req._id)} title="Decline" aria-label="Decline friend request"
        className="w-11 h-11 rounded-[10px] border-[1.5px] border-border bg-transparent text-text-muted cursor-pointer flex items-center justify-center shrink-0 transition-[transform,border-color,color] duration-150 hover:border-text-muted hover:text-text-primary active:scale-95"
      >
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

  // Load history (skip if already cached in the socket store from a previous visit)
  useEffect(() => {
    if (conversations[friend._id]) { setLoading(false); return; }
    setLoading(true);
    api.get(`/friends/messages/${friend._id}`)
      .then(({ data }) => seedConversation(friend._id, data.messages))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4.5 py-3.5 border-b border-border bg-card shrink-0">
        <button
          onClick={onBack} aria-label="Back to conversations"
          className="sm:hidden bg-none border-none cursor-pointer text-text-muted w-11 h-11 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
        >
          <ArrowLeft size={18} />
        </button>
        <Link to={`/profile/${friend._id}`} className="flex items-center gap-2.5 no-underline">
          <Avatar user={friend} size={36} showOnline online={online} />
          <div>
            <p className="m-0 text-sm font-bold text-text-primary transition-colors duration-150 hover:text-accent">
              {friend.name}
            </p>
            <p className="m-0 text-[11px]" style={{ color: online ? '#22c55e' : 'var(--text-muted)' }}>
              {online ? 'Online' : 'Offline'}
            </p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
        {loading ? (
          <div className="text-center pt-10 text-text-muted text-[13px]">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center pt-10 text-text-muted text-sm flex flex-col items-center gap-2">
            <MessageSquare size={28} className="opacity-40" />
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === user._id || msg.sender?._id === user._id;
            return (
              <motion.div
                key={msg._id ?? i}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] min-h-11 box-border px-3.5 py-3 text-[15px] leading-[1.6] flex flex-col justify-center ${isMe ? 'rounded-[16px_16px_4px_16px]' : 'rounded-[16px_16px_16px_4px]'}`}
                  style={{ background: isMe ? 'var(--accent)' : 'var(--surface-2)', color: isMe ? '#fff' : 'var(--text-primary)' }}
                >
                  <p className="m-0">{msg.text}</p>
                  <p className="mt-0.5 mb-0 text-[10px] opacity-65 text-right">
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
              className="flex gap-1 items-center pl-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-text-muted"
                  style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card flex gap-2 shrink-0">
        <input
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${friend.name}…`}
          aria-label="Message input"
          className="flex-1 min-h-11 box-border px-3.5 rounded-[10px] border-[1.5px] border-border bg-input text-text-primary text-base outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-dim)]"
        />
        <motion.button
          whileTap={{ scale: 0.93 }} onClick={handleSend} disabled={!text.trim()}
          aria-label="Send message"
          className={`w-11 h-11 rounded-[10px] border-none flex items-center justify-center shrink-0 transition-colors duration-150 ${text.trim() ? 'bg-(image:--btn-grad) text-white shadow-btn cursor-pointer' : 'bg-surface-2 text-text-muted cursor-not-allowed'}`}
        >
          <Send size={16} />
        </motion.button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

/* ── Main Messages Page ── */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [active, setActive] = useState(null); // friend object currently chatting

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: pending = [] } = usePendingRequests();
  const loading = friendsLoading;

  const { isOnline } = useSocketStore();

  if (!user) { navigate('/'); return null; }

  const handleAccept = async (requestId) => {
    await api.post(`/friends/accept/${requestId}`);
    invalidateFriends();
  };

  const handleDecline = async (requestId) => {
    await api.delete(`/friends/${requestId}`);
    invalidateFriends();
  };

  return (
    <div className="min-h-svh bg-surface-0">
      <Navbar />
      <div className={`max-w-[960px] mx-auto p-4 sm:p-5 grid gap-4 h-[calc(100svh-80px)] grid-cols-1 ${active ? 'sm:grid-cols-[300px_1fr]' : ''}`}>
        {/* Sidebar / friend list */}
        <div className={[
          'bg-card border border-card-border rounded-2xl overflow-hidden flex flex-col',
          active ? 'hidden sm:flex' : 'flex max-w-[480px] mx-auto w-full',
        ].join(' ')}>
          <div className="px-4.5 pt-4.5 pb-3 border-b border-divider">
            <h2 className="mb-1 text-base font-bold text-text-primary">
              Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* Pending requests */}
            {pending.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1 mb-2">
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
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1 mb-2">
              Friends {loading ? '' : `(${friends.length})`}
            </p>

            {loading ? (
              <div className="text-center p-8 text-text-muted text-[13px]">
                Loading…
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center px-4 py-8 text-text-muted text-[13px]">
                <MessageSquare size={28} className="mb-2 opacity-40" />
                <p className="m-0">No friends yet. Search for people to connect!</p>
              </div>
            ) : (
              friends.map((f) => {
                const online = isOnline(f._id);
                const isActive = active?._id === f._id;
                return (
                  <motion.div
                    key={f._id} whileHover={{ background: 'var(--hover-bg)' }}
                    onClick={() => setActive(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(f); } }}
                    className={`flex items-center gap-2.5 min-h-11 p-2.5 rounded-[10px] cursor-pointer transition-colors duration-[120ms] ${isActive ? 'bg-accent-dim' : 'bg-transparent'}`}
                  >
                    <Avatar user={f} size={40} showOnline online={online} />
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[15px] font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                        {f.name}
                      </p>
                      <p className="m-0 text-[13px]" style={{ color: online ? '#22c55e' : 'var(--text-muted)' }}>
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
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden flex flex-col">
            <ChatWindow friend={active} onBack={() => setActive(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
