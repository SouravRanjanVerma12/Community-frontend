// FriendsList.jsx – all in one file
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, UserMinus, Users, Loader2 } from "lucide-react";
import api from "../../api/axiosInstance";

/* ──────────────────────────────────────
   ENHANCED AVATAR – with size variants & online status
   ────────────────────────────────────── */
const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
};

// Consistent color palette (deterministic)
const AVATAR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
  "#FF9F43",
  "#00D2D3",
  "#1DD1A1",
  "#F368E0",
  "#EE5A24",
  "#0ABDE3",
  "#10AC84",
  "#FF6B81",
  "#A29BFE",
  "#FD79A8",
  "#FDCB6E",
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({
  name = "User",
  src = null,
  size = "md", // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  online = false,
  showStatus = false,
  onClick = null,
  className = "",
}) {
  const pixelSize = SIZE_MAP[size] || SIZE_MAP.md;
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  const [imgError, setImgError] = useState(false);

  const handleError = () => setImgError(true);

  // Image fallback
  if (src && !imgError) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          display: "inline-flex",
          flexShrink: 0,
          cursor: onClick ? "pointer" : "default",
        }}
        onClick={onClick}
      >
        <img
          src={src}
          alt={name}
          onError={handleError}
          style={{
            width: pixelSize,
            height: pixelSize,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid var(--border)",
            background: "var(--surface-2)",
          }}
        />
        {showStatus && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: pixelSize * 0.28,
              height: pixelSize * 0.28,
              borderRadius: "50%",
              border: "2px solid var(--card-bg)",
              background: online ? "#16a34a" : "#6b7280",
            }}
          />
        )}
      </div>
    );
  }

  // Fallback – initials
  return (
    <div
      className={className}
      style={{
        width: pixelSize,
        height: pixelSize,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: pixelSize * 0.35,
        fontWeight: "700",
        flexShrink: 0,
        userSelect: "none",
        border: "2px solid var(--border)",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      {initials}
      {showStatus && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: pixelSize * 0.28,
            height: pixelSize * 0.28,
            borderRadius: "50%",
            border: "2px solid var(--card-bg)",
            background: online ? "#16a34a" : "#6b7280",
          }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────
   FRIEND ROW – uses new Avatar with online status
   ────────────────────────────────────── */
export function FriendRow({
  friend,
  friendshipId,
  onRemove,
  onNavigate,
  compact = false,
  isOnline = false, // <-- pass online from parent
}) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);

  const handleMessage = () => {
    navigate("/messages");
    onNavigate?.();
  };

  const handleRemove = async () => {
    if (!friendshipId || removing) return;
    setRemoving(true);
    try {
      await api.delete(`/friends/${friendshipId}`);
      onRemove?.(friend._id);
    } catch {
      /* ignore */
    } finally {
      setRemoving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: compact ? "10px 16px" : "12px 20px",
        borderBottom: "1px solid var(--divider)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--hover-bg)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Link
        to={`/profile/${friend._id}`}
        onClick={onNavigate}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flex: 1,
          textDecoration: "none",
          minWidth: 0,
        }}
      >
        <Avatar
          name={friend.name}
          src={friend.avatarUrl || null}
          size={compact ? "sm" : "md"}
          showStatus={true}
          online={isOnline}
        />
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: compact ? "13px" : "14px",
              fontWeight: "600",
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {friend.name}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            @{friend.username || friend.email?.split("@")[0]}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <button
          onClick={handleMessage}
          title="Send message"
          style={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            border: "1.5px solid var(--border)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <MessageSquare size={13} />
        </button>
        {friendshipId && (
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Unfriend"
            style={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              border: "1.5px solid var(--border)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: removing ? "not-allowed" : "pointer",
              color: "var(--text-muted)",
              opacity: removing ? 0.5 : 1,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!removing) {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {removing ? (
              <Loader2
                size={13}
                style={{ animation: "spin 0.8s linear infinite" }}
              />
            ) : (
              <UserMinus size={13} />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────
   MAIN FRIENDS LIST
   ────────────────────────────────────── */
export default function FriendsList({ userId, isOwnProfile }) {
  const [friends, setFriends] = useState([]);
  const [friendships, setFriendships] = useState({});
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // <-- add this

  // Fetch friends
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const endpoint = isOwnProfile ? "/friends" : `/users/${userId}/friends`;
    api
      .get(endpoint)
      .then(({ data }) => {
        // data.friends is an array of user objects
        setFriends(data.friends || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load friends.");
      })
      .finally(() => setLoading(false));
  }, [userId, isOwnProfile]);

  // (Optional) Subscribe to socket online/offline events – if you have socket
  // Place this in a parent or use a context; here's a placeholder:
  useEffect(() => {
    // If you have a socket instance, listen for online/offline events
    // and update onlineUsers set.
    // Example:
    // const socket = getSocket();
    // if (!socket) return;
    // socket.on('users:online', ({ userIds }) => setOnlineUsers(new Set(userIds)));
    // socket.on('user:online', ({ userId }) => setOnlineUsers(prev => new Set(prev).add(userId)));
    // socket.on('user:offline', ({ userId }) => setOnlineUsers(prev => { const next = new Set(prev); next.delete(userId); return next; }));
    // return () => { socket.off(...); };
  }, []);

  const handleRemove = (removedId) => {
    setFriends((prev) => prev.filter((f) => f._id !== removedId));
  };

  if (!isOwnProfile) return null;

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}
      >
        <Loader2
          size={24}
          color="var(--text-muted)"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "14px",
        }}
      >
        <Users
          size={32}
          color="var(--text-muted)"
          style={{ marginBottom: "12px" }}
        />
        <p
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "var(--text-primary)",
            marginBottom: "6px",
          }}
        >
          No friends yet
        </p>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Search for people to connect with.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--divider)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}
        >
          Friends
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {friends.length} total
        </span>
      </div>
      <AnimatePresence>
        {friends.map((f) => (
          <FriendRowWithId
            key={f._id}
            friend={f}
            onRemove={handleRemove}
            isOnline={onlineUsers.has(f._id)} // <-- pass online status
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* Wrapper to fetch friendshipId per friend */
function FriendRowWithId({ friend, onRemove, isOnline }) {
  const [friendshipId, setFriendshipId] = useState(null);

  useEffect(() => {
    api
      .get(`/friends/status/${friend._id}`)
      .then(({ data }) => {
        if (data.id) setFriendshipId(data.id);
      })
      .catch(() => {});
  }, [friend._id]);

  return (
    <FriendRow
      friend={friend}
      friendshipId={friendshipId}
      onRemove={onRemove}
      isOnline={isOnline}
    />
  );
}
