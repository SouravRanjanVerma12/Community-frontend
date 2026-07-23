import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, ArrowLeft, X, MoreHorizontal, User,
  UserCheck, UserX, Search, Sparkles, Users, Command
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
  (name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function Avatar({ user, size = 40, showOnline = false, online = false }) {
  const img = user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.name} style={{ width: size, height: size }} className="rounded-full object-cover block shadow-xs" />
  ) : (
    <div style={{ width: size, height: size, background: avatarColor(user.name || 'User'), fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold select-none shadow-xs">
      {initials(user.name || 'User')}
    </div>
  );

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      {img}
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card"
          style={{ background: online ? '#22c55e' : '#6b7280' }}
        />
      )}
    </div>
  );
}

/* ── Pending request row ── */
function PendingRow({ req, onAccept, onDecline }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/80 border border-border/50 mb-2 transition-all"
    >
      <Link to={`/profile/${req.requester._id}`} className="flex items-center gap-3 flex-1 min-w-0 no-underline">
        <Avatar user={req.requester} size={38} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary m-0 overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-150 hover:text-accent">
            {req.requester.name}
          </p>
          <p className="text-xs text-text-muted m-0">sent you a friend request</p>
        </div>
      </Link>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onAccept(req._id)} title="Accept" aria-label="Accept friend request"
          className="w-8 h-8 rounded-lg border-none bg-accent text-white shadow-xs text-xs font-semibold cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-accent-light active:scale-95"
        >
          <UserCheck size={15} />
        </button>
        <button
          onClick={() => onDecline(req._id)} title="Decline" aria-label="Decline friend request"
          className="w-8 h-8 rounded-lg border border-border bg-card text-text-muted cursor-pointer flex items-center justify-center transition-all duration-150 hover:border-error-border hover:text-error active:scale-95"
        >
          <UserX size={15} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Full-Height Chat window ── */
function ChatWindow({ friend, onBack }) {
  const { user } = useAuthStore();
  const { conversations, sendMessage, sendTyping, seedConversation, typingMap } = useSocketStore();
  // Subscribe to onlineUsers directly so status dot re-renders when socket emits user:online / user:offline
  const online = useSocketStore((s) => s.onlineUsers.has(String(friend._id || friend.id || '')));
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef(null);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);
  const isInitialLoad = useRef(true);

  // Normalize to string so socket-keyed conversation (always String) is always found
  const friendId = String(friend._id || friend.id || '');
  const messages = conversations[friendId] ?? [];
  const isTyping = typingMap[friendId];

  // Close chat on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Click outside to close options dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Load history (skip if already cached in the socket store from a previous visit)
  useEffect(() => {
    if (conversations[friendId]) { setLoading(false); return; }
    setLoading(true);
    api.get(`/friends/messages/${friendId}`)
      .then(({ data }) => seedConversation(friendId, data.messages))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isInitialLoad.current) {
      // Instant jump on history load — no animation so user sees bottom immediately
      el.scrollTop = el.scrollHeight;
      if (messages.length > 0) isInitialLoad.current = false;
    } else {
      // Smooth scroll for each new incoming/outgoing message
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, isTyping]);

  // Reset initial-load flag when switching friends
  useEffect(() => {
    isInitialLoad.current = true;
  }, [friendId]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(friendId, text.trim());
    setText('');
    sendTyping(friendId, false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    sendTyping(friendId, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(friendId, false), 1500);
  };

  const fmtTime = (d) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack} aria-label="Back to conversations"
            className="md:hidden bg-none border-none cursor-pointer text-text-muted w-9 h-9 flex items-center justify-center rounded-xl shrink-0 transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <Link to={`/profile/${friend._id}`} className="flex items-center gap-3 no-underline min-w-0">
            <Avatar user={friend} size={42} showOnline online={online} />
            <div className="min-w-0">
              <p className="m-0 text-base font-bold text-text-primary transition-colors duration-150 hover:text-accent truncate">
                {friend.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full transition-colors" style={{ background: isTyping ? 'var(--accent)' : online ? '#22c55e' : '#6b7280' }} />
                <p className="m-0 text-xs font-medium transition-colors" style={{ color: isTyping ? 'var(--accent)' : online ? '#22c55e' : 'var(--text-muted)' }}>
                  {isTyping ? `${friend.name} is typing...` : online ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Options Dropdown */}
          {/* <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setOptionsOpen((v) => !v)}
              title="Chat options"
              aria-label="Chat options"
              className="w-9 h-9 rounded-full border border-border/60 bg-surface-1 hover:bg-surface-2 flex items-center justify-center cursor-pointer text-text-muted hover:text-text-primary transition-all"
            >
              <MoreHorizontal size={17} />
            </button>
            <AnimatePresence>
              {optionsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-52 bg-card border border-border rounded-2xl shadow-xl p-2 z-30"
                >
                  <Link
                    to={`/profile/${friend._id}`}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-xl no-underline transition-colors"
                  >
                    <User size={15} /> View Profile
                  </Link>
                  <div className="h-px bg-border/60 my-1.5" />
                  <button
                    onClick={() => { setOptionsOpen(false); onBack(); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl border-none bg-transparent cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2"><X size={15} /> Close Chat</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted">ESC</kbd>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div> */}

          {/* Modern Close Pill Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            title="Close chat (Esc)"
            aria-label="Close chat"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-1 border border-border/80 hover:border-accent/40 hover:bg-surface-2 text-text-secondary hover:text-text-primary cursor-pointer text-xs font-semibold transition-all shadow-xs group"
          >
            {/* <span>Close</span> */}
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted">ESC</kbd>
            <X size={14} className="text-text-muted group-hover:text-text-primary transition-colors" />
          </motion.button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-2.5 bg-surface-0/40">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted text-xs gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-border border-t-accent animate-spin" />
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-12 text-text-muted text-sm gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent-dim flex items-center justify-center text-accent">
              <Sparkles size={26} />
            </div>
            <div className="text-center max-w-xs">
              <p className="font-bold text-text-primary text-base m-0 mb-1">Start a conversation</p>
              <p className="text-xs text-text-muted m-0">Send your first message to connect with {friend.name}.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === user._id || msg.sender?._id === user._id || msg.sender === user.id || msg.sender?.id === user.id;
            return (
              <motion.div
                key={msg._id ?? i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-[65%] px-4 py-3 text-[14px] leading-[1.6] flex flex-col shadow-xs ${
                    isMe
                      ? 'rounded-[20px_20px_4px_20px] bg-accent text-white'
                      : 'rounded-[20px_20px_20px_4px] bg-card border border-border/70 text-text-primary'
                  }`}
                >
                  <p className="m-0 whitespace-pre-wrap break-words">{msg.text}</p>
                  <p className={`mt-1 mb-0 text-[10px] text-right font-medium ${isMe ? 'text-white/70' : 'text-text-muted'}`}>
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
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-card border border-border/60 w-max text-xs text-text-muted shadow-xs"
            >
              <span>{friend.name} is typing</span>
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input Field Bar */}
      <div className="p-4 border-t border-border bg-card flex items-center gap-3 shrink-0 shadow-lg">
        <input
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${friend.name}…`}
          aria-label="Message input"
          className="flex-1 min-h-[46px] px-4 rounded-xl border border-border bg-input text-text-primary text-sm outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <motion.button
          whileTap={{ scale: 0.94 }} onClick={handleSend} disabled={!text.trim()}
          aria-label="Send message"
          className={`w-[46px] h-[46px] rounded-xl border-none flex items-center justify-center shrink-0 transition-all duration-150 ${
            text.trim()
              ? 'bg-accent text-white shadow-md cursor-pointer hover:bg-accent-light'
              : 'bg-surface-2 text-text-muted cursor-not-allowed opacity-60'
          }`}
        >
          <Send size={18} />
        </motion.button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

/* ── Full-Screen Empty State ── */
function EmptyChatState() {
  return (
    <div className="flex-1 h-full bg-surface-0 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background ambient radial wash */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-dim),transparent_70%)] opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md flex flex-col items-center z-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-card border border-border shadow-xl flex items-center justify-center text-accent mb-6 relative">
          <MessageSquare size={36} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-surface-0" />
        </div>

        <h2 className="text-2xl font-extrabold text-text-primary m-0 mb-2 tracking-tight">
          Your Messages
        </h2>
        <p className="text-sm text-text-muted m-0 mb-6 leading-relaxed">
          Select a friend from the conversation list on the left to start chatting in real-time, share ideas, and collaborate.
        </p>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs text-text-muted shadow-xs">
          <Command size={14} className="text-accent" />
          <span>Press <kbd className="font-mono font-bold text-text-primary px-1 rounded bg-surface-2 border border-border">Esc</kbd> anytime to close an active chat</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Full-Screen Messages Page ── */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const [active, setActive] = useState(null); // friend object currently chatting
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'online'

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: pending = [] } = usePendingRequests();
  const loading = friendsLoading;

  // Subscribe to onlineUsers as a reactive selector so the sidebar re-renders
  // whenever user:online / user:offline events fire — plain destructure won't trigger re-render
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const { conversations, seedConversation, typingMap } = useSocketStore();
  const isOnline = (id) => onlineUsers.has(String(id || ''));

  // Prefetch recent message snippets for all friends so last message preview shows without opening
  useEffect(() => {
    if (!friends.length) return;
    friends.forEach((f) => {
      const friendId = String(f._id || f.id || '');
      if (!conversations[friendId]) {
        api.get(`/friends/messages/${friendId}`)
          .then(({ data }) => seedConversation(friendId, data.messages))
          .catch(() => {});
      }
    });
  }, [friends, conversations, seedConversation]);

  if (!user) return <div className="text-center p-15 text-text-muted">Log in to see your messages.</div>;

  const handleAccept = async (requestId) => {
    await api.post(`/friends/accept/${requestId}`);
    invalidateFriends();
  };

  const handleDecline = async (requestId) => {
    await api.delete(`/friends/${requestId}`);
    invalidateFriends();
  };

  // Filter friends based on search query and tab
  const filteredFriends = friends.filter((f) => {
    const matchesSearch = f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const online = isOnline(f._id || f.id);
    if (activeFilter === 'online') return matchesSearch && online;
    return matchesSearch;
  });

  return (
    <div className="h-svh flex flex-col bg-surface-0 font-sans text-text-primary overflow-hidden">
      <Navbar />

      {/* Main Full-Width Full-Height Messaging Workspace */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Left Sidebar (Conversations List) */}
        <div className={[
          'w-full md:w-[320px] lg:w-[360px] shrink-0 border-r border-border bg-card flex flex-col h-full z-10 transition-all',
          active ? 'hidden md:flex' : 'flex',
        ].join(' ')}>
          
          {/* Header & Search Bar */}
          <div className="p-4 border-b border-border flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-extrabold text-text-primary m-0 flex items-center gap-2">
                Messages
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-dim text-accent">
                  {friends.length}
                </span>
              </h1>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-1 border border-border text-xs text-text-primary outline-none transition-all focus:border-accent focus:bg-card"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-text-muted hover:text-text-primary bg-none border-none cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-1 border border-border/50 text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all ${
                  activeFilter === 'all' ? 'bg-card text-text-primary shadow-xs' : 'bg-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                All ({friends.length})
              </button>
              <button
                onClick={() => setActiveFilter('online')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all ${
                  activeFilter === 'online' ? 'bg-card text-text-primary shadow-xs' : 'bg-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Online ({friends.filter(f => isOnline(f._id || f.id)).length})
              </button>
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Pending Requests Section */}
            {pending.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1 mb-2">
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

            {/* Friends Section */}
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1 mb-2">
              Friends List
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-text-muted text-xs gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-border border-t-accent animate-spin" />
                <span>Loading friends...</span>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center px-4 py-10 text-text-muted text-xs flex flex-col items-center gap-2">
                <Users size={28} className="opacity-40" />
                <p className="m-0 font-medium">
                  {searchQuery ? 'No conversations matching your search.' : 'No friends yet. Search for people to connect!'}
                </p>
              </div>
            ) : (
              filteredFriends.map((f) => {
                const friendId = f._id || f.id;
                const online = isOnline(friendId);
                const isActive = active?._id === friendId || active?.id === friendId;
                const friendMsgs = conversations[friendId] || [];
                const lastMsg = friendMsgs[friendMsgs.length - 1];
                const friendTyping = typingMap[friendId];

                return (
                  <motion.div
                    key={friendId}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setActive(f)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(f); } }}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 mb-1 border ${
                      isActive
                        ? 'bg-accent-dim border-accent/40 shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-hover'
                    }`}
                  >
                    <Avatar user={f} size={42} showOnline online={online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="m-0 text-sm font-bold text-text-primary truncate">
                          {f.name}
                        </p>
                        {lastMsg?.createdAt && !friendTyping && (
                          <span className="text-[11px] text-text-muted shrink-0 ml-1 font-medium">
                            {timeAgo(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      {(() => {
                        if (friendTyping) {
                          return (
                            <p className="m-0 text-xs font-semibold text-accent flex items-center gap-1 truncate">
                              <span>typing</span>
                              <span className="flex gap-0.5 items-center">
                                {[0, 1, 2].map((i) => (
                                  <span
                                    key={i}
                                    className="w-1 h-1 rounded-full bg-accent"
                                    style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                                  />
                                ))}
                              </span>
                            </p>
                          );
                        }
                        if (lastMsg) {
                          const isMe = lastMsg.sender === user._id || lastMsg.sender?._id === user._id || lastMsg.sender === user.id || lastMsg.sender?.id === user.id;
                          const prefix = isMe ? 'You: ' : '';
                          return (
                            <p className={`m-0 text-xs truncate ${!isMe ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>
                              <span className="text-text-muted">{prefix}</span>{lastMsg.text}
                            </p>
                          );
                        }
                        return (
                          <p className="m-0 text-xs truncate" style={{ color: online ? '#22c55e' : 'var(--text-muted)' }}>
                            {online ? 'Active now' : 'Offline'}
                          </p>
                        );
                      })()}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Chat Panel */}
        <div className="flex-1 h-full flex flex-col bg-surface-0 overflow-hidden">
          {active ? (
            <ChatWindow friend={active} onBack={() => setActive(null)} />
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>
    </div>
  );
}
