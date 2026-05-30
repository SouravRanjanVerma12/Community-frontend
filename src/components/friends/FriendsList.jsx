import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, UserMinus, Users, Loader2 } from 'lucide-react';
import api from '../../api/axiosInstance';

function Avatar({ name, src, size = 38 }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  if (src) return (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},55%,55%)`, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: '700', flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

/* Single friend row — used in both Navbar dropdown and ProfilePage tab */
export function FriendRow({ friend, friendshipId, onRemove, onNavigate, compact = false }) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);

  const handleMessage = () => {
    navigate('/messages');
    onNavigate?.();
  };

  const handleRemove = async () => {
    if (!friendshipId || removing) return;
    setRemoving(true);
    try {
      await api.delete(`/friends/${friendshipId}`);
      onRemove?.(friend._id);
    } catch { /* ignore */ }
    finally { setRemoving(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: compact ? '10px 16px' : '12px 20px',
        borderBottom: '1px solid var(--divider)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Link
        to={`/profile/${friend._id}`}
        onClick={onNavigate}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, textDecoration: 'none', minWidth: 0 }}
      >
        <Avatar name={friend.name} src={friend.avatarUrl || null} size={compact ? 34 : 38} />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: compact ? '13px' : '14px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {friend.name}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            @{friend.username || friend.email?.split('@')[0]}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={handleMessage}
          title="Send message"
          style={{
            width: 30, height: 30, borderRadius: '8px',
            border: '1.5px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <MessageSquare size={13} />
        </button>
        {friendshipId && (
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Unfriend"
            style={{
              width: 30, height: 30, borderRadius: '8px',
              border: '1.5px solid var(--border)', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: removing ? 'not-allowed' : 'pointer',
              color: 'var(--text-muted)', opacity: removing ? 0.5 : 1, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (!removing) { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {removing ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <UserMinus size={13} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* Full friends list — used in ProfilePage tab */
export default function FriendsList({ userId, isOwnProfile }) {
  const [friends, setFriends] = useState([]);
  const [friendships, setFriendships] = useState({}); // { userId: friendshipId }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOwnProfile) return;
    setLoading(true);
    api.get('/friends')
      .then(({ data }) => {
        // data.friends is an array of populated user objects
        // but we need friendship IDs to allow removal
        // Re-fetch raw friendships to get IDs
        setFriends(data.friends);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOwnProfile]);

  // Fetch raw friendships to get friendship IDs for removal
  useEffect(() => {
    if (!isOwnProfile || friends.length === 0) return;
    // Build a map: friendUserId → friendshipId
    api.get('/friends')
      .then(() => {
        // We need raw friendship docs with _id — use a separate approach:
        // The getFriends controller returns user objects but not friendship IDs.
        // We'll store an empty map for now; removal handled via status check per-friend.
        // NOTE: The remove button will still work if we do a status check per friend.
      })
      .catch(() => {});
  }, [friends.length, isOwnProfile]);

  const handleRemove = (removedId) => {
    setFriends((prev) => prev.filter((f) => f._id !== removedId));
  };

  if (!isOwnProfile) return null;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <Loader2 size={24} color="var(--text-muted)" style={{ animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '14px',
      }}>
        <Users size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No friends yet</p>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Search for people to connect with.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Friends</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{friends.length} total</span>
      </div>
      <AnimatePresence>
        {friends.map((f) => (
          <FriendRowWithId key={f._id} friend={f} onRemove={handleRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* Wraps FriendRow with a per-friend friendship ID lookup */
function FriendRowWithId({ friend, onRemove }) {
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
    />
  );
}
