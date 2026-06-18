import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Copy, Check, Send, Users2, CheckCircle, ClipboardList } from 'lucide-react';
import JoinProjectModal from './JoinProjectModal';
import CollabRequesters from './CollabRequesters';
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
  const domain   = DOMAINS.find((d) => d.value === post.domain) ?? DOMAINS[0];
  const isCollab = post.type === 'collab';
  const COLLAB_COLOR = '#0891b2';
  const isOwnPost = user && post.author._id === user._id;
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [requested, setRequested]         = useState(false);

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
        border: `1px solid ${isCollab ? COLLAB_COLOR + '35' : 'var(--card-border)'}`,
        borderRadius: '14px',
        padding: '20px 22px',
        cursor: 'default',
        boxShadow: isCollab ? `0 2px 12px ${COLLAB_COLOR}18` : 'var(--shadow-sm)',
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
        {/* Collab badge OR domain badge */}
        {isCollab ? (
          <span style={{
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '600',
            background: `${COLLAB_COLOR}18`, color: COLLAB_COLOR,
            display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
          }}>
            <Users2 size={11} /> Collab
          </span>
        ) : (
          <span style={{
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '500',
            background: `${domain.color}12`, color: domain.color, flexShrink: 0,
          }}>
            {domain.label}
          </span>
        )}
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

      {/* Collab details */}
      {isCollab && (
        <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '12px', background: `${COLLAB_COLOR}0a`, border: `1px solid ${COLLAB_COLOR}25`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Project name + member progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            {post.projectName && (
              <p style={{ fontSize: '13px', fontWeight: '700', color: COLLAB_COLOR, margin: 0 }}>
                🚀 {post.projectName}
              </p>
            )}
            {post.membersNeeded === 0 ? (
              /* Unlimited */
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: `${COLLAB_COLOR}10`, border: `1px solid ${COLLAB_COLOR}25` }}>
                <Users2 size={11} color={COLLAB_COLOR} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: COLLAB_COLOR }}>
                  {post.memberCount ?? 0} joined · Unlimited
                </span>
              </div>
            ) : post.membersNeeded > 0 ? (
              /* Fixed slots */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Users2 size={12} color={COLLAB_COLOR} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: COLLAB_COLOR }}>
                    {post.memberCount ?? 0} / {post.membersNeeded} joined
                  </span>
                </div>
                <div style={{ width: '120px', height: '5px', borderRadius: '3px', background: `${COLLAB_COLOR}20`, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((post.memberCount ?? 0) / post.membersNeeded) * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: '3px', background: (post.memberCount ?? 0) >= post.membersNeeded ? '#22c55e' : COLLAB_COLOR }}
                  />
                </div>
                {(post.memberCount ?? 0) >= post.membersNeeded && (
                  <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '600' }}>Team full ✓</span>
                )}
              </div>
            ) : null}
          </div>

          {/* Tech stack */}
          {post.techStack?.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Tech Stack</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {post.techStack.map((t) => (
                  <span key={t} style={{ padding: '3px 10px', borderRadius: '6px', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', fontFamily: 'var(--mono)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Creator: link to dedicated review page */}
          {isOwnPost && (post.requestCount ?? 0) > 0 && (
            <Link to={`/collab/${post._id}/requests`} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ x: 2 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '10px',
                  border: `1.5px solid ${COLLAB_COLOR}35`,
                  background: `${COLLAB_COLOR}08`,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={15} color={COLLAB_COLOR} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: COLLAB_COLOR }}>
                    Review applications
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '20px', background: COLLAB_COLOR, color: '#fff', fontSize: '11px', fontWeight: '700' }}>
                    {post.requestCount}
                  </span>
                  <span style={{ fontSize: '14px', color: COLLAB_COLOR }}>→</span>
                </div>
              </motion.div>
            </Link>
          )}

          {/* Non-creator: public requester list inline */}
          {!isOwnPost && (
            <CollabRequesters
              postId={post._id}
              requestCount={post.requestCount ?? 0}
              isCreator={false}
            />
          )}

          {/* Request count — social proof */}
          {(post.requestCount ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px', borderRadius: '20px',
                background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)',
                fontSize: '12px', fontWeight: '600', color: '#d97706',
              }}>
                🔥 {post.requestCount} {post.requestCount === 1 ? 'person' : 'people'} interested
              </span>
            </div>
          )}

          {/* Roles + Join button */}
          {post.rolesNeeded?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Looking For</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {post.rolesNeeded.map((r) => (
                    <span key={r} style={{ padding: '4px 12px', borderRadius: '20px', background: COLLAB_COLOR, color: '#fff', fontSize: '12px', fontWeight: '500' }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              {!isOwnPost && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => !requested && setJoinModalOpen(true)}
                  style={{
                    padding: '8px 18px', borderRadius: '10px', border: 'none',
                    background: requested ? 'var(--surface-2)' : COLLAB_COLOR,
                    color: requested ? 'var(--text-secondary)' : '#fff',
                    fontSize: '13px', fontWeight: '700', cursor: requested ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    flexShrink: 0, transition: 'all 0.15s',
                    boxShadow: requested ? 'none' : `0 4px 14px ${COLLAB_COLOR}40`,
                  }}
                >
                  {requested ? <CheckCircle size={14} /> : <Users2 size={14} />}
                  {requested ? 'Request Sent' : 'Join Project'}
                </motion.button>
              )}
              {isOwnPost && (
                <span style={{ fontSize: '12px', color: COLLAB_COLOR, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users2 size={12} /> Your project
                </span>
              )}
            </div>
          )}
        </div>
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

      {/* Join project modal */}
      <AnimatePresence>
        {joinModalOpen && (
          <JoinProjectModal
            post={post}
            onClose={() => {
              setJoinModalOpen(false);
              setRequested(true);
            }}
          />
        )}
      </AnimatePresence>

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
