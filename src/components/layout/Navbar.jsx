import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, LogIn, UserPlus, Zap, Compass, Users2,
  Search, MessageSquare, X, UserCheck, Bell, Users,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useSocketStore } from '../../stores/socketStore';
import { FriendRow } from '../friends/FriendsList';
import api from '../../api/axiosInstance';
import Button from '../ui/Button';
import NotificationBell from './NotificationBell';
import { useFriends, usePendingRequests, useFriendStatus, invalidateFriends } from '../../hooks/useFriends';

function Avatar({ name, src, size = 34 }) {
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  if (src) return (
    <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0 border-2 border-border" />
  );
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-semibold shrink-0 select-none">
      {initials}
    </div>
  );
}

/* ── Global search with user results ── */
function GlobalSearch() {
  const [q, setQ]             = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState({}); // { [userId]: { status, id } }
  const debounce = useRef(null);
  const wrapRef  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(debounce.current);
    if (val.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/friends/search?q=${encodeURIComponent(val.trim())}`);
        setResults(data.users);
        // Fetch friend status for each
        const statuses = {};
        await Promise.all(data.users.map(async (u) => {
          try {
            const r = await api.get(`/friends/status/${u._id}`);
            statuses[u._id] = r.data;
          } catch { statuses[u._id] = { status: 'none' }; }
        }));
        setFriendStatus(statuses);
        setOpen(true);
      } finally { setLoading(false); }
    }, 350);
  };

  const sendRequest = async (userId) => {
    await api.post(`/friends/request/${userId}`);
    setFriendStatus((s) => ({ ...s, [userId]: { status: 'pending', iAmRequester: true } }));
    invalidateFriends();
  };

  const cancelRequest = async (userId) => {
    const fs = friendStatus[userId];
    if (fs?.id) await api.delete(`/friends/${fs.id}`);
    setFriendStatus((s) => ({ ...s, [userId]: { status: 'none' } }));
    invalidateFriends();
  };

  const FriendButton = ({ user }) => {
    const fs = friendStatus[user._id] ?? { status: 'none' };
    if (fs.status === 'accepted') return (
      <span className="text-[11px] text-[#22c55e] font-semibold flex items-center gap-[3px]">
        <UserCheck size={12} /> Friends
      </span>
    );
    if (fs.status === 'pending' && fs.iAmRequester) return (
      <button onClick={() => cancelRequest(user._id)}
        className="text-[11px] px-2.5 py-1 rounded-md border-[1.5px] border-border bg-transparent text-text-muted cursor-pointer">
        Pending
      </button>
    );
    if (fs.status === 'pending' && !fs.iAmRequester) return (
      <button onClick={() => sendRequest(user._id)}
        className="text-[11px] px-2.5 py-1 rounded-md border-none bg-(image:--btn-grad) text-white cursor-pointer font-semibold">
        Accept
      </button>
    );
    return (
      <button onClick={() => sendRequest(user._id)}
        className="text-[11px] px-2.5 py-1 rounded-md border-none bg-(image:--btn-grad) text-white cursor-pointer font-semibold">
        + Add
      </button>
    );
  };

  return (
    <div ref={wrapRef} className="relative flex-1 max-w-[340px] ml-3">
      <div className="flex items-center gap-2 px-3 rounded-[10px] border-[1.5px] border-border bg-input transition-colors duration-150">
        <Search size={14} color="var(--text-muted)" />
        <input
          value={q}
          onChange={handleChange}
          onFocus={() => q.length >= 2 && setOpen(true)}
          placeholder="Search people…"
          className="flex-1 py-2 bg-transparent border-none outline-none text-[13px] text-text-primary"
        />
        {q && (
          <button onClick={() => { setQ(''); setResults([]); setOpen(false); }}
            className="bg-none border-none cursor-pointer text-text-muted flex p-0">
            <X size={13} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute top-[calc(100%+6px)] left-0 right-0 z-500 bg-card border border-card-border rounded-xl shadow-popup overflow-hidden"
          >
            {loading ? (
              <div className="p-3.5 text-center text-[13px] text-text-muted">
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="p-3.5 text-center text-[13px] text-text-muted">
                No results
              </div>
            ) : (
              results.map((u) => (
                <div key={u._id} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-divider">
                  <Link to={`/profile/${u._id}`} onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 flex-1 no-underline">
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${[...u.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)` }}>
                          {u.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                    }
                    <div>
                      <p className="m-0 text-[13px] font-semibold text-text-primary">{u.name}</p>
                      <p className="m-0 text-[11px] text-text-muted">@{u.username || u.email?.split('@')[0]}</p>
                    </div>
                  </Link>
                  <FriendButton user={u} />
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Friend requests notification bell ── */
function FriendBell() {
  const { data: pending = [] } = usePendingRequests();
  const count = pending.length;

  if (count === 0) return null;

  return (
    <Link to="/messages" className="relative flex text-text-muted no-underline" title="Friend requests">
      <Bell size={18} />
      <span className="absolute top-[-5px] right-[-5px] w-[15px] h-[15px] rounded-full bg-(image:--btn-grad) text-white text-[9px] font-bold flex items-center justify-center border-2 border-nav">
        {count}
      </span>
    </Link>
  );
}

/* ── Friends dropdown ── */
function FriendsDropdown() {
  const [open, setOpen] = useState(false);
  const { data: friends = [], isLoading: loading } = useFriends();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = () => setOpen((v) => !v);

  const handleRemove = () => invalidateFriends();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        title="Friends"
        className={`flex items-center bg-none border-none cursor-pointer p-0 transition-colors duration-150 ${open ? 'text-accent' : 'text-text-muted'}`}
      >
        <Users size={18} />
        {friends.length > 0 && (
          <span className={`ml-[3px] text-[11px] font-bold ${open ? 'text-accent' : 'text-text-muted'}`}>
            {friends.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+12px)] -right-2 z-500 bg-card border border-card-border rounded-2xl shadow-popup w-[min(300px,90vw)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 pt-[13px] pb-[11px] border-b border-divider flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">Friends</span>
              {!loading && (
                <span className="text-xs text-text-muted">
                  {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                </span>
              )}
            </div>

            {/* Body */}
            {loading ? (
              <div className="py-7 flex justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-border border-t-accent animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="py-7 px-4 text-center">
                <Users size={28} color="var(--text-muted)" className="mb-2.5" />
                <p className="text-[13px] text-text-muted m-0">No friends yet</p>
                <p className="text-xs text-text-faint mt-1 mb-0">Use search to find people</p>
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {friends.map((f) => (
                    <FriendRowWithId
                      key={f._id}
                      friend={f}
                      onRemove={handleRemove}
                      onNavigate={() => setOpen(false)}
                      compact
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Wraps FriendRow, looks up friendship ID for the remove action */
function FriendRowWithId({ friend, onRemove, onNavigate, compact }) {
  const { data: status } = useFriendStatus(friend._id);
  return (
    <FriendRow
      friend={friend}
      friendshipId={status?.id ?? null}
      onRemove={onRemove}
      onNavigate={onNavigate}
      compact={compact}
    />
  );
}

const NAV_TABS = [
  { to: '/explore',  label: 'Explore',  icon: Compass       },
  { to: '/collab',   label: 'Collab',   icon: Users2        },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-100 h-15 bg-nav border-b border-nav-border flex items-center px-5 gap-3 transition-colors duration-250">
      {/* Logo */}
      <Link to="/explore" className="flex items-center gap-2 no-underline shrink-0 mr-2">
        <div className="w-[30px] h-[30px] rounded-lg bg-(image:--btn-grad) flex items-center justify-center">
          <Zap size={16} color="#fff" fill="#fff" />
        </div>
        <span className="hidden sm:inline text-base font-bold text-text-primary tracking-[-0.3px]">
          Prograstic
        </span>
      </Link>

      {/* Center tabs */}
      <div className="flex items-stretch h-full gap-0.5">
        {NAV_TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => [
              'flex items-center gap-1.5 px-3.5 no-underline whitespace-nowrap text-sm',
              'transition-colors duration-150 border-b-2',
              isActive ? 'border-accent text-accent font-semibold' : 'border-transparent text-text-secondary font-medium',
            ].join(' ')}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Search */}
      {user && <GlobalSearch />}

      {/* Spacer to push right actions to the edge */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {user ? (
          <>
            <Link to="/messages" className="flex text-text-muted no-underline" title="Messages">
              <MessageSquare size={18} />
            </Link>
            <FriendsDropdown />
            <FriendBell />
            <NotificationBell />
            <Link to={`/profile/${user._id}`} className="flex items-center gap-2 no-underline">
              <Avatar name={user.name} src={user.avatarUrl || null} />
              <span className="hidden sm:inline text-sm font-medium text-text-secondary">
                {user.name.split(' ')[0]}
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Log out">
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </>
        ) : (
          <>
            <Link to="/" className="px-3.5 py-[7px] rounded-lg border-[1.5px] border-border text-text-secondary text-[13px] font-medium flex items-center gap-1.5 no-underline">
              <LogIn size={14} /> Log in
            </Link>
            <Link to="/register" className="px-3.5 py-[7px] rounded-lg bg-(image:--btn-grad) shadow-btn text-white text-[13px] font-semibold flex items-center gap-1.5 no-underline">
              <UserPlus size={14} /> Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
