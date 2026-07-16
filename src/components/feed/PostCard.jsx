import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Heart, MessageCircle, Share2, Copy, Check, Send, Users2, CheckCircle, ClipboardList,
  MoreHorizontal, Pencil, Trash2, X as XIcon, Bookmark,
} from 'lucide-react';
import JoinProjectModal from './JoinProjectModal';
import CollabRequesters from './CollabRequesters';
import { confirm } from '../ui/ConfirmDialog';
import { DOMAINS } from '../../data/mockPosts';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axiosInstance';
import { useComments, removeCachedComment } from '../../hooks/useComments';
import { updateCachedPost, removeCachedPost, useBookmarkedPosts, toggleCachedBookmark } from '../../hooks/usePosts';

function Avatar({ name, src, size = 36 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  if (src) {
    return (
      <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
    );
  }
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-semibold shrink-0 select-none">
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
    <div className="rounded-[10px] overflow-hidden border border-border mt-3">
      {/* Header bar */}
      <div className="flex justify-between items-center px-3.5 py-2 bg-code-header border-b border-border">
        <span className="text-xs font-medium text-text-secondary font-mono">
          {language}
        </span>
        <button
          onClick={copy}
          className={[
            'flex items-center gap-1 px-2 py-[3px] rounded-[5px] border-none cursor-pointer text-xs transition-colors duration-150',
            copied ? 'bg-success-bg text-success' : 'bg-transparent text-text-muted',
          ].join(' ')}
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      {/* Code */}
      <pre className="m-0 p-4 bg-code-bg text-code-text text-[13px] leading-[1.65] font-mono overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function PostCard({ post: initialPost, index = 0 }) {
  const { user } = useAuthStore();
  // `post` is just the current prop — no local shadow copy. Live updates (likes,
  // comments, edits, deletes) come in via socketStore's centralized listeners
  // writing into the react-query cache, which flows back down as a fresh prop.
  const post = initialPost;
  const [showComments, setShowComments] = useState(false);
  const { data: comments = [], isLoading: commentsLoading } = useComments(post._id, showComments);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(initialPost.likes?.includes(user?._id));
  const { data: bookmarkedPosts = [] } = useBookmarkedPosts(!!user);
  const isBookmarked = bookmarkedPosts.some((p) => p._id === post._id);

  const domain   = DOMAINS.find((d) => d.value === post.domain) ?? DOMAINS[0];
  const isCollab = post.type === 'collab';
  const COLLAB_COLOR = '#3a3d4a';
  const isOwnPost = user && post.author._id === user._id;
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [requested, setRequested]         = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody]   = useState(post.type === 'code' ? post.codeSnippet : post.body);
  const [saving, setSaving]       = useState(false);
  const [deleted, setDeleted]     = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Resync the optimistic like-toggle when the post prop changes for a reason
  // other than this user's own click (e.g. someone else's like arriving via
  // socketStore -> react-query cache -> fresh prop).
  useEffect(() => {
    setLiked(post.likes?.includes(user?._id));
  }, [post.likes, user?._id]);

  const toggleLike = async () => {
    if (!user) return;
    setLiked(!liked); // optimistic
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLiked(liked); // revert on error
    }
  };

  const toggleBookmark = async () => {
    if (!user) return;
    const next = !isBookmarked;
    toggleCachedBookmark(post, next); // optimistic
    try {
      await api.post(`/posts/${post._id}/bookmark`);
    } catch {
      toggleCachedBookmark(post, !next); // revert on error
      toast.error('Failed to update saved posts');
    }
  };

  const handleToggleComments = () => {
    setShowComments((v) => !v);
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

  const startEdit = () => {
    setEditTitle(post.title);
    setEditBody(post.type === 'code' ? post.codeSnippet : post.body);
    setEditing(true);
    setMenuOpen(false);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const payload = post.type === 'code'
        ? { title: editTitle.trim(), codeSnippet: editBody }
        : { title: editTitle.trim(), body: editBody };
      const { data } = await api.patch(`/posts/${post._id}`, payload);
      updateCachedPost(post._id, data.post);
      setEditing(false);
      toast.success('Post updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async () => {
    setMenuOpen(false);
    if (!await confirm('Delete this post? This cannot be undone.', { title: 'Delete post', confirmLabel: 'Delete' })) return;
    try {
      await api.delete(`/posts/${post._id}`);
      removeCachedPost(post._id);
      setDeleted(true);
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!await confirm('Delete this comment?', { title: 'Delete comment', confirmLabel: 'Delete' })) return;
    try {
      const { data } = await api.delete(`/posts/${post._id}/comments/${commentId}`);
      removeCachedComment(post._id, commentId);
      updateCachedPost(post._id, { ...post, commentCount: data.commentCount });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (deleted) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
      className="rounded-[14px] px-[22px] py-5 cursor-default transition-[box-shadow,background-color,border-color] duration-200 bg-card"
      style={{
        border: `1px solid ${isCollab ? COLLAB_COLOR + '35' : 'var(--card-border)'}`,
        boxShadow: isCollab ? `0 2px 12px ${COLLAB_COLOR}18` : 'var(--shadow-sm)',
      }}
    >
      {/* Author row */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <Link to={`/profile/${post.author._id}`} className="shrink-0">
          <Avatar name={post.author.name} src={post.author.avatarUrl || null} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author._id}`} className="no-underline">
            <p className="text-sm font-semibold text-text-primary m-0 inline transition-colors duration-[120ms] hover:text-accent">
              {post.author.name}
            </p>
          </Link>
          <p className="text-xs text-text-muted m-0">
            @{post.author.username || post.author.email?.split('@')[0] || 'user'} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {/* Collab badge OR domain badge */}
        {isCollab ? (
          <span
            className="px-2.5 py-[3px] rounded-full text-xs font-semibold flex items-center gap-1 shrink-0"
            style={{ background: `${COLLAB_COLOR}18`, color: COLLAB_COLOR }}
          >
            <Users2 size={11} /> Collab
          </span>
        ) : (
          <span
            className="px-2.5 py-[3px] rounded-full text-xs font-medium shrink-0"
            style={{ background: `${domain.color}12`, color: domain.color }}
          >
            {domain.label}
          </span>
        )}

        {/* Owner menu: edit / delete */}
        {isOwnPost && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-text-muted cursor-pointer transition-colors duration-150 hover:bg-hover"
            >
              <MoreHorizontal size={15} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-[calc(100%+4px)] right-0 z-50 bg-card border border-card-border rounded-xl shadow-popup overflow-hidden w-[150px]"
                >
                  <button
                    onClick={startEdit}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 border-none bg-transparent text-[13px] text-text-secondary cursor-pointer text-left hover:bg-hover"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 border-none bg-transparent text-[13px] text-error cursor-pointer text-left hover:bg-hover"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Title + body, or inline edit form */}
      {editing ? (
        <div className="flex flex-col gap-2 mb-3.5">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="px-3 py-2 rounded-lg border-[1.5px] border-border bg-input text-text-primary text-[15px] font-bold outline-none"
            placeholder="Title"
          />
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={post.type === 'code' ? 6 : 3}
            className={`px-3 py-2 rounded-lg border-[1.5px] border-border bg-input text-text-primary text-sm outline-none resize-vertical ${post.type === 'code' ? 'font-mono' : ''}`}
            placeholder={post.type === 'code' ? 'Code' : 'Body'}
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[1.5px] border-border bg-transparent text-text-secondary text-[13px] font-medium cursor-pointer"
            >
              <XIcon size={13} /> Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none bg-accent text-white text-[13px] font-semibold cursor-pointer disabled:opacity-60"
            >
              <Check size={13} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Title */}
          <h3 className="text-base font-bold text-text-primary leading-[1.4] mb-2 tracking-[-0.2px]">
            {post.title}
          </h3>

          {/* Body */}
          {post.body && (
            <p className={`text-sm text-text-secondary leading-[1.65] ${post.type === 'code' ? 'mb-0' : 'mb-3.5'}`}>
              {post.body}
            </p>
          )}

          {/* Code block */}
          {post.type === 'code' && post.codeSnippet && (
            <CodeBlock code={post.codeSnippet} language={post.language} />
          )}
        </>
      )}

      {/* Collab details */}
      {isCollab && (
        <div
          className="mt-3.5 px-4 py-3.5 rounded-xl flex flex-col gap-3"
          style={{ background: `${COLLAB_COLOR}0a`, border: `1px solid ${COLLAB_COLOR}25` }}
        >
          {/* Project name + member progress */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {post.projectName && (
              <p className="text-[13px] font-bold m-0" style={{ color: COLLAB_COLOR }}>
                🚀 {post.projectName}
              </p>
            )}
            {post.membersNeeded === 0 ? (
              /* Unlimited */
              <div
                className="flex items-center gap-[5px] px-2.5 py-1 rounded-full"
                style={{ background: `${COLLAB_COLOR}10`, border: `1px solid ${COLLAB_COLOR}25` }}
              >
                <Users2 size={11} color={COLLAB_COLOR} />
                <span className="text-[11px] font-bold" style={{ color: COLLAB_COLOR }}>
                  {post.memberCount ?? 0} joined · Unlimited
                </span>
              </div>
            ) : post.membersNeeded > 0 ? (
              /* Fixed slots */
              <div className="flex flex-col items-end gap-1 min-w-[120px]">
                <div className="flex items-center gap-[5px]">
                  <Users2 size={12} color={COLLAB_COLOR} />
                  <span className="text-xs font-bold" style={{ color: COLLAB_COLOR }}>
                    {post.memberCount ?? 0} / {post.membersNeeded} joined
                  </span>
                </div>
                <div className="w-[120px] h-[5px] rounded-[3px] overflow-hidden" style={{ background: `${COLLAB_COLOR}20` }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((post.memberCount ?? 0) / post.membersNeeded) * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-[3px]"
                    style={{ background: (post.memberCount ?? 0) >= post.membersNeeded ? '#22c55e' : COLLAB_COLOR }}
                  />
                </div>
                {(post.memberCount ?? 0) >= post.membersNeeded && (
                  <span className="text-[10px] text-[#22c55e] font-semibold">Team full ✓</span>
                )}
              </div>
            ) : null}
          </div>

          {/* Tech stack */}
          {post.techStack?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.06em] mb-1.5">Tech Stack</p>
              <div className="flex flex-wrap gap-[5px]">
                {post.techStack.map((t) => (
                  <span key={t} className="px-2.5 py-[3px] rounded-md bg-surface-2 text-text-secondary text-xs font-medium font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Creator: link to dedicated review page */}
          {isOwnPost && (post.requestCount ?? 0) > 0 && (
            <Link to={`/collab/${post._id}/requests`} className="no-underline">
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] cursor-pointer transition-colors duration-150"
                style={{ border: `1.5px solid ${COLLAB_COLOR}35`, background: `${COLLAB_COLOR}08` }}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList size={15} color={COLLAB_COLOR} />
                  <span className="text-[13px] font-semibold" style={{ color: COLLAB_COLOR }}>
                    Review applications
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold" style={{ background: COLLAB_COLOR }}>
                    {post.requestCount}
                  </span>
                  <span className="text-sm" style={{ color: COLLAB_COLOR }}>→</span>
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
            <div className="flex items-center gap-[5px]">
              <span className="inline-flex items-center gap-[5px] px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.10)] border border-[rgba(245,158,11,0.25)] text-xs font-semibold text-warning">
                🔥 {post.requestCount} {post.requestCount === 1 ? 'person' : 'people'} interested
              </span>
            </div>
          )}

          {/* Roles + Join button */}
          {post.rolesNeeded?.length > 0 && (
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div className="flex-1">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.06em] mb-1.5">Looking For</p>
                <div className="flex flex-wrap gap-[5px]">
                  {post.rolesNeeded.map((r) => (
                    <span key={r} className="px-3 py-1 rounded-full text-white text-xs font-medium" style={{ background: COLLAB_COLOR }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              {!isOwnPost && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => !requested && setJoinModalOpen(true)}
                  className={[
                    'px-[18px] py-2 rounded-[10px] border-none text-[13px] font-bold flex items-center gap-1.5 shrink-0 transition-all duration-150',
                    requested ? 'bg-surface-2 text-text-secondary cursor-default' : 'text-white cursor-pointer',
                  ].join(' ')}
                  style={requested ? {} : { background: COLLAB_COLOR, boxShadow: `0 4px 14px ${COLLAB_COLOR}40` }}
                >
                  {requested ? <CheckCircle size={14} /> : <Users2 size={14} />}
                  {requested ? 'Request Sent' : 'Join Project'}
                </motion.button>
              )}
              {isOwnPost && (
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: COLLAB_COLOR }}>
                  <Users2 size={12} /> Your project
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-1 mt-4 pt-3.5 border-t border-divider">
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
        {user && (
          <ActionBtn
            icon={<Bookmark size={15} fill={isBookmarked ? 'var(--accent)' : 'none'} color={isBookmarked ? 'var(--accent)' : 'var(--text-muted)'} />}
            onClick={toggleBookmark}
            active={isBookmarked}
            activeColor="var(--accent)"
          />
        )}
        <div className="ml-auto">
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
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-divider">
              {/* Add comment input */}
              {user ? (
                <div className="flex gap-2 mb-4">
                  <Avatar name={user.name} src={user.avatarUrl || null} size={30} />
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-input text-text-primary text-[13px] outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={[
                      'w-[34px] h-[34px] rounded-lg border-none flex items-center justify-center',
                      newComment.trim() ? 'bg-accent text-white cursor-pointer' : 'bg-surface-2 text-text-muted cursor-not-allowed',
                    ].join(' ')}
                  >
                    <Send size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-text-muted mb-4">
                  Log in to join the conversation.
                </p>
              )}

              {/* Comments list */}
              <div className="flex flex-col gap-3">
                {commentsLoading ? (
                  <p className="text-xs text-text-muted">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-text-muted">No comments yet.</p>
                ) : (
                  comments.map((c, i) => (
                    <div key={c._id || i} className="flex gap-2">
                      <Link to={`/profile/${c.author?._id}`}>
                        <Avatar name={c.author?.name} src={c.author?.avatarUrl || null} size={28} />
                      </Link>
                      <div className="flex-1">
                        <div className="bg-surface-2 px-3 py-2 rounded-[0_12px_12px_12px]">
                          <Link to={`/profile/${c.author?._id}`} className="no-underline">
                            <p className="m-0 text-xs font-bold text-text-primary mb-0.5">
                              {c.author?.name}
                            </p>
                          </Link>
                          <p className="m-0 text-[13px] text-text-secondary leading-[1.4]">
                            {c.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 ml-1">
                          <p className="m-0 text-[10px] text-text-muted">
                            {timeAgo(c.createdAt || Date.now())}
                          </p>
                          {user && c.author?._id === user._id && (
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="flex items-center gap-1 border-none bg-transparent text-text-faint text-[10px] cursor-pointer transition-colors duration-150 hover:text-error"
                            >
                              <Trash2 size={10} /> Delete
                            </button>
                          )}
                        </div>
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
      className={`flex items-center gap-[5px] px-2.5 py-[5px] rounded-lg border-none bg-transparent text-[13px] font-medium transition-colors duration-[120ms] hover:bg-hover ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ color: active ? activeColor : 'var(--text-muted)' }}
    >
      {icon}
      {label !== undefined && <span>{label}</span>}
    </button>
  );
}
