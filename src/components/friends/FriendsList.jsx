// FriendsList.jsx – all in one file
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, UserMinus, Users, Loader2 } from "lucide-react";
import api from "../../api/axiosInstance";
import { useFriends, useFriendStatus, invalidateFriends } from "../../hooks/useFriends";

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
        className={`relative inline-flex shrink-0 ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
        onClick={onClick}
      >
        <img
          src={src}
          alt={name}
          onError={handleError}
          style={{ width: pixelSize, height: pixelSize }}
          className="rounded-full object-cover border-2 border-border bg-surface-2"
        />
        {showStatus && (
          <div
            style={{ width: pixelSize * 0.28, height: pixelSize * 0.28, background: online ? "#16a34a" : "#6b7280" }}
            className="absolute bottom-0 right-0 rounded-full border-2 border-card"
          />
        )}
      </div>
    );
  }

  // Fallback – initials
  return (
    <div
      style={{ width: pixelSize, height: pixelSize, background: color, fontSize: pixelSize * 0.35 }}
      className={`rounded-full text-white flex items-center justify-center font-bold shrink-0 select-none border-2 border-border relative ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
      onClick={onClick}
    >
      {initials}
      {showStatus && (
        <div
          style={{ width: pixelSize * 0.28, height: pixelSize * 0.28, background: online ? "#16a34a" : "#6b7280" }}
          className="absolute bottom-0 right-0 rounded-full border-2 border-card"
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
      className={`flex items-center gap-3 border-b border-divider transition-colors duration-150 hover:bg-hover ${compact ? 'px-4 py-2.5' : 'px-5 py-3'}`}
    >
      <Link
        to={`/profile/${friend._id}`}
        onClick={onNavigate}
        className="flex items-center gap-2.5 flex-1 no-underline min-w-0"
      >
        <Avatar
          name={friend.name}
          src={friend.avatarUrl || null}
          size={compact ? "sm" : "md"}
          showStatus={true}
          online={isOnline}
        />
        <div className="min-w-0">
          <p className={`m-0 font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis ${compact ? 'text-[13px]' : 'text-sm'}`}>
            {friend.name}
          </p>
          <p className="m-0 text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
            @{friend.username || friend.email?.split("@")[0]}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={handleMessage}
          title="Send message"
          className="w-7.5 h-7.5 rounded-lg border-[1.5px] border-border bg-transparent flex items-center justify-center cursor-pointer text-text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          <MessageSquare size={13} />
        </button>
        {friendshipId && (
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Unfriend"
            className={`w-7.5 h-7.5 rounded-lg border-[1.5px] border-border bg-transparent flex items-center justify-center text-text-muted transition-colors duration-150 ${removing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-error-border hover:text-error'}`}
          >
            {removing ? (
              <Loader2 size={13} className="animate-spin" />
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
export default function FriendsList({ isOwnProfile }) {
  const [onlineUsers] = useState(new Set()); // <-- add this
  // This component only ever renders for the signed-in user's own profile
  // (see early return below), so it always shares the same cached "my
  // friends" query as the Navbar dropdown and Messages page.
  const { data: friends = [], isLoading: loading } = useFriends();

  const handleRemove = () => invalidateFriends();

  if (!isOwnProfile) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} color="var(--text-muted)" className="animate-spin" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center px-5 py-15 bg-card border border-card-border rounded-2xl">
        <Users size={32} color="var(--text-muted)" className="mb-3" />
        <p className="text-base font-semibold text-text-primary mb-1.5">
          No friends yet
        </p>
        <p className="text-sm text-text-muted">
          Search for people to connect with.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-divider flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary">
          Friends
        </span>
        <span className="text-xs text-text-muted">
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
  const { data: status } = useFriendStatus(friend._id);
  const friendshipId = status?.id ?? null;

  return (
    <FriendRow
      friend={friend}
      friendshipId={friendshipId}
      onRemove={onRemove}
      isOnline={isOnline}
    />
  );
}
