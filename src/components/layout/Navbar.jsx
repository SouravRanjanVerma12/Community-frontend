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

function Avatar({ name, src, size = 34 }) {
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  if (src) return (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }} />
  );
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '600', flexShrink: 0, userSelect: 'none' }}>
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
  };

  const cancelRequest = async (userId) => {
    const fs = friendStatus[userId];
    if (fs?.id) await api.delete(`/friends/${fs.id}`);
    setFriendStatus((s) => ({ ...s, [userId]: { status: 'none' } }));
  };

  const FriendButton = ({ user }) => {
    const fs = friendStatus[user._id] ?? { status: 'none' };
    if (fs.status === 'accepted') return (
      <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <UserCheck size={12} /> Friends
      </span>
    );
    if (fs.status === 'pending' && fs.iAmRequester) return (
      <button onClick={() => cancelRequest(user._id)}
        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
        Pending
      </button>
    );
    if (fs.status === 'pending' && !fs.iAmRequester) return (
      <button onClick={() => sendRequest(user._id)}
        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>
        Accept
      </button>
    );
    return (
      <button onClick={() => sendRequest(user._id)}
        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>
        + Add
      </button>
    );
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: '340px', marginLeft: '12px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '0 12px', borderRadius: '10px',
        border: '1.5px solid var(--border)', background: 'var(--input-bg)',
        transition: 'border-color 0.15s',
      }}>
        <Search size={14} color="var(--text-muted)" />
        <input
          value={q}
          onChange={handleChange}
          onFocus={() => q.length >= 2 && setOpen(true)}
          placeholder="Search people…"
          style={{
            flex: 1, padding: '8px 0', background: 'transparent',
            border: 'none', outline: 'none', fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        />
        {q && (
          <button onClick={() => { setQ(''); setResults([]); setOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
            <X size={13} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 500,
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '12px', boxShadow: 'var(--shadow-popup)',
              overflow: 'hidden',
            }}>
            {loading ? (
              <div style={{ padding: '14px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                No results
              </div>
            ) : (
              results.map((u) => (
                <div key={u._id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderBottom: '1px solid var(--divider)',
                }}>
                  <Link to={`/profile/${u._id}`} onClick={() => setOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, textDecoration: 'none' }}>
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${[...u.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: '700' }}>
                          {u.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                    }
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>@{u.username || u.email?.split('@')[0]}</p>
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
  const [count, setCount] = useState(0);

  useEffect(() => {
    api.get('/friends/pending')
      .then(({ data }) => setCount(data.requests.length))
      .catch(() => {});
  }, []);

  if (count === 0) return null;

  return (
    <Link to="/messages" style={{ position: 'relative', display: 'flex', color: 'var(--text-muted)', textDecoration: 'none' }} title="Friend requests">
      <Bell size={18} />
      <span style={{
        position: 'absolute', top: -5, right: -5,
        width: 15, height: 15, borderRadius: '50%',
        background: 'var(--accent)', color: '#fff',
        fontSize: '9px', fontWeight: '700',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid var(--nav-bg)',
      }}>
        {count}
      </span>
    </Link>
  );
}

/* ── Friends dropdown ── */
function FriendsDropdown() {
  const [open, setOpen]       = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const load = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const { data } = await api.get('/friends');
      setFriends(data.friends);
      setLoaded(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const handleRemove = (removedId) => {
    setFriends((prev) => prev.filter((f) => f._id !== removedId));
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        title="Friends"
        style={{
          display: 'flex', alignItems: 'center', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0,
          color: open ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.15s',
        }}
      >
        <Users size={18} />
        {friends.length > 0 && (
          <span style={{
            marginLeft: '3px', fontSize: '11px', fontWeight: '700',
            color: open ? 'var(--accent)' : 'var(--text-muted)',
          }}>
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
            style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: '-8px', zIndex: 500,
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '14px', boxShadow: 'var(--shadow-popup)',
              width: '300px', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '13px 16px 11px', borderBottom: '1px solid var(--divider)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Friends</span>
              {!loading && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                </span>
              )}
            </div>

            {/* Body */}
            {loading ? (
              <div style={{ padding: '28px 0', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : friends.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                <Users size={28} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No friends yet</p>
                <p style={{ fontSize: '12px', color: 'var(--text-faint)', margin: '4px 0 0' }}>Use search to find people</p>
              </div>
            ) : (
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
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
  const [friendshipId, setFriendshipId] = useState(null);
  useEffect(() => {
    api.get(`/friends/status/${friend._id}`)
      .then(({ data }) => { if (data.id) setFriendshipId(data.id); })
      .catch(() => {});
  }, [friend._id]);
  return (
    <FriendRow
      friend={friend}
      friendshipId={friendshipId}
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
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: '60px', background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: '12px',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      {/* Logo */}
      <Link to="/explore" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0, marginRight: '8px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={16} color="#fff" fill="#fff" />
        </div>
        <span className="nav-brand-label" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          DevCommunity
        </span>
      </Link>

      {/* Center tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', gap: '2px' }}>
        {NAV_TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0 14px',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '14px', fontWeight: isActive ? '600' : '500',
              textDecoration: 'none',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            })}
          >
            <Icon size={15} />
            <span className="nav-tab-label">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Search */}
      {user && <GlobalSearch />}

      {/* Spacer to push right actions to the edge */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {user ? (
          <>
            <Link to="/messages" style={{ display: 'flex', color: 'var(--text-muted)', textDecoration: 'none' }} title="Messages">
              <MessageSquare size={18} />
            </Link>
            <FriendsDropdown />
            <FriendBell />
            <Link to={`/profile/${user._id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Avatar name={user.name} src={user.avatarUrl || null} />
              <span className="nav-user-label" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                {user.name.split(' ')[0]}
              </span>
            </Link>
            <button onClick={handleLogout} title="Log out" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <LogOut size={14} />
              <span className="nav-logout-label">Log out</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/" style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <LogIn size={14} /> Log in
            </Link>
            <Link to="/register" style={{ padding: '7px 14px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <UserPlus size={14} /> Sign up
            </Link>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nav-logout-label { display: none; }
          .nav-user-label   { display: none; }
          .nav-brand-label  { display: none; }
        }
        @media (max-width: 480px) { .nav-tab-label { display: none; } }
      `}</style>
    </nav>
  );
}
