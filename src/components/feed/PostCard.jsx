import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Copy, Check, Send } from 'lucide-react';
import { DOMAINS } from '../../data/mockPosts';
import { useAuthStore } from '../../stores/authStore';
import { getSocket, useSocketStore } from '../../stores/socketStore';
import api from '../../api/axiosInstance';

function Avatar({ name, src, size = 36 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  if (src) {
    return (
      <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},55%,55%)`, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: '600', flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', marginTop: '12px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 14px',
        background: 'var(--code-header-bg)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
          {language}
        </span>
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '5px', border: 'none',
            background: copied ? '#dcfce7' : 'transparent',
            color: copied ? '#16a34a' : 'var(--text-muted)',
            fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      {/* Code */}
      <pre style={{
        margin: 0, padding: '16px',
        background: 'var(--code-bg)',
        color: 'var(--code-text)',
        fontSize: '13px', lineHeight: '1.65',
        fontFamily: 'var(--mono)',
        overflowX: 'auto',
        whiteSpace: 'pre',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function PostCard({ post: initialPost, index = 0 }) {
  const { user } = useAuthStore();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(initialPost.likes?.includes(user?._id));

  const connected = useSocketStore((s) => s.connected);
  const domain = DOMAINS.find((d) => d.value === post.domain) ?? DOMAINS[0];

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !connected) return;

    const onUpdated = (data) => {
      if (data.postId === post._id) {
        setPost((p) => ({ ...p, likes: data.likes }));
        setLiked(data.likes.includes(user?._id));
      }
    };

    const onCommented = (data) => {
      if (data.postId === post._id) {
        setPost((p) => ({ ...p, commentCount: data.commentCount }));
        if (showComments) {
          setComments((prev) => [...prev, data.comment]);
        }
      }
    };

    socket.on('post:updated', onUpdated);
    socket.on('post:commented', onCommented);

    return () => {
      socket.off('post:updated', onUpdated);
      socket.off('post:commented', onCommented);
    };
  }, [post._id, user?._id, showComments, connected]);

  const toggleLike = async () => {
    if (!user) return;
    setLiked(!liked); // optimistic
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLiked(liked); // revert on error
    }
  };

  const loadComments = async () => {
    if (!commentsLoaded) {
      const { data } = await api.get(`/posts/${post._id}/comments`);
      setComments(data.comments);
      setCommentsLoaded(true);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    const txt = newComment.trim();
    setNewComment('');
    await api.post(`/posts/${post._id}/comments`, { text: txt });
  };

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '14px',
        padding: '20px 22px',
        cursor: 'default',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s, background 0.25s, border-color 0.25s',
      }}
    >
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <Link to={`/profile/${post.author._id}`} style={{ flexShrink: 0 }}>
          <Avatar name={post.author.name} src={post.author.avatarUrl || null} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/profile/${post.author._id}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'inline', transition: 'color 0.12s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              {post.author.name}
            </p>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            @{post.author.username || post.author.email?.split('@')[0] || 'user'} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {/* Domain badge */}
        <span style={{
          padding: '3px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: '500',
          background: `${domain.color}12`,
          color: domain.color,
          flexShrink: 0,
        }}>
          {domain.label}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '16px', fontWeight: '700',
        color: 'var(--text-primary)', lineHeight: '1.4',
        marginBottom: '8px', letterSpacing: '-0.2px',
      }}>
        {post.title}
      </h3>

      {/* Body */}
      {post.body && (
        <p style={{
          fontSize: '14px', color: 'var(--text-secondary)',
          lineHeight: '1.65', marginBottom: post.type === 'code' ? '0' : '14px',
        }}>
          {post.body}
        </p>
      )}

      {/* Code block */}
      {post.type === 'code' && post.codeSnippet && (
        <CodeBlock code={post.codeSnippet} language={post.language} />
      )}

      {/* Action row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginTop: '16px', paddingTop: '14px',
        borderTop: '1px solid var(--divider)',
      }}>
        <ActionBtn
          icon={<Heart size={15} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : 'var(--text-muted)'} />}
          label={post.likes?.length || 0}
          onClick={toggleLike}
          active={liked}
          activeColor="#ef4444"
        />
        <ActionBtn
          icon={<MessageCircle size={15} color={showComments ? 'var(--accent)' : 'var(--text-muted)'} />}
          label={post.commentCount || 0}
          onClick={handleToggleComments}
          active={showComments}
          activeColor="var(--accent)"
        />
        <div style={{ marginLeft: 'auto' }}>
          <ActionBtn icon={<Share2 size={15} color="var(--text-muted)" />} onClick={share} />
        </div>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid var(--divider)' }}>
              {/* Add comment input */}
              {user ? (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <Avatar name={user.name} src={user.avatarUrl || null} size={30} />
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Write a comment..."
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '8px',
                      border: '1.5px solid var(--border)', background: 'var(--input-bg)',
                      color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                    }}
                  />
                  <button onClick={handleAddComment} disabled={!newComment.trim()}
                    style={{
                      width: 34, height: 34, borderRadius: '8px', border: 'none',
                      background: newComment.trim() ? 'var(--accent)' : 'var(--surface-2)',
                      color: newComment.trim() ? '#fff' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                    }}>
                    <Send size={14} />
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Log in to join the conversation.
                </p>
              )}

              {/* Comments list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {!commentsLoaded ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No comments yet.</p>
                ) : (
                  comments.map((c, i) => (
                    <div key={c._id || i} style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/profile/${c.author?._id}`}>
                        <Avatar name={c.author?.name} src={c.author?.avatarUrl || null} size={28} />
                      </Link>
                      <div>
                        <div style={{
                          background: 'var(--surface-2)', padding: '8px 12px', borderRadius: '0 12px 12px 12px',
                        }}>
                          <Link to={`/profile/${c.author?._id}`} style={{ textDecoration: 'none' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                              {c.author?.name}
                            </p>
                          </Link>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {c.text}
                          </p>
                        </div>
                        <p style={{ margin: '4px 0 0 4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                          {timeAgo(c.createdAt || Date.now())}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function ActionBtn({ icon, label, onClick, active, activeColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 10px', borderRadius: '8px', border: 'none',
        background: 'transparent',
        color: active ? activeColor : 'var(--text-muted)',
        fontSize: '13px', fontWeight: '500',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.background = 'var(--hover-bg)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}
      {label !== undefined && <span>{label}</span>}
    </button>
  );
}
