import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Check, Loader2, Trophy, Sparkles, Flame, Users2, Heart, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTrendingTags, useTopPosts } from '../../hooks/usePosts';
import { useSuggestions } from '../../hooks/useProfile';
import { DOMAINS } from '../../data/mockPosts';
import api from '../../api/axiosInstance';
import { queryClient } from '../../api/queryClient';

function Avatar({ name, src, size = 32 }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const hue = [...(name ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0 border border-border/50"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }}
      className="rounded-full text-white flex items-center justify-center font-semibold shrink-0 select-none shadow-sm"
    >
      {initials}
    </div>
  );
}

function Section({ icon: Icon, title, extra, children, className = '' }) {
  return (
    <div className={`bg-card border border-card-border/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-250 hover:shadow-[0_6px_24px_rgba(0,0,0,0.04)] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-accent" />}
          <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-text-muted select-none">
            {title}
          </span>
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center p-4">
      <Loader2 size={16} color="var(--text-muted)" className="animate-spin" />
    </div>
  );
}

export default function RightSidebar() {
  const { user, updateFollowing } = useAuthStore();
  const navigate = useNavigate();
  const [composing, setComposing] = useState(false);
  const [postBody, setPostBody] = useState('');
  const [posted, setPosted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const { data: tags, isLoading: tagsLoading }         = useTrendingTags();
  const { data: topPosts, isLoading: topLoading }       = useTopPosts();
  const { data: suggestions, isLoading: suggestLoading } = useSuggestions();

  const toggleFollow = async (id) => {
    if (!user) return;
    try {
      const { data } = await api.post(`/users/${id}/follow`);
      updateFollowing(data.following);
    } catch { /* ignore */ }
  };

  const handlePost = async () => {
    if (!postBody.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const content = postBody.trim();
      const title = content.length > 60 ? content.slice(0, 60) + '…' : content;
      const userDomain = user?.domain?.[0] || 'webdev';

      await api.post('/posts', {
        type: 'text',
        domain: userDomain,
        title,
        body: content,
      });

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setPosted(true);
      setTimeout(() => {
        setPosted(false);
        setComposing(false);
        setPostBody('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="hidden xl:flex sticky top-[112px] h-[calc(100svh-112px)] overflow-y-auto w-72 shrink-0 flex-col gap-4 pb-8 scrollbar-none">
      {/* Quick share */}
      <Section icon={Sparkles} title="Quick Share">
        {!composing ? (
          <button
            onClick={() => setComposing(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/80 hover:border-accent/40 bg-input/60 hover:bg-input text-text-muted text-[13px] cursor-text transition-all duration-200 group"
          >
            <Avatar name={user?.name || 'Guest'} src={user?.avatarUrl} size={24} />
            <span className="group-hover:text-text-secondary transition-colors truncate">
              {user ? `What are you building today?` : 'Log in to post…'}
            </span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-2.5"
          >
            <div className="relative">
              <textarea
                autoFocus
                rows={3}
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="Share an update, idea, or link…"
                className="w-full px-3 py-2.5 rounded-xl border border-accent-border/80 focus:border-accent text-[13px] leading-relaxed resize-none outline-none font-[inherit] text-text-primary bg-input/80 transition-all duration-150"
              />
              <span className="absolute right-2.5 bottom-2 text-[10px] font-mono text-text-muted">
                {postBody.length}/280
              </span>
            </div>
            {error && <p className="text-xs text-rose-500 font-medium m-0">{error}</p>}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">Public post</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setComposing(false)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-transparent text-xs font-medium cursor-pointer text-text-secondary hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handlePost}
                  disabled={!postBody.trim() || submitting || posted}
                  className={`px-3.5 py-1.5 rounded-lg border-none text-xs font-semibold transition-all duration-200 ${
                    posted
                      ? 'bg-success-bg text-success'
                      : postBody.trim() && !submitting
                      ? 'bg-accent text-white cursor-pointer shadow-[0_2px_10px_rgba(30,157,241,0.3)]'
                      : 'bg-accent-dim text-white/50 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Publishing…' : posted ? 'Posted! ✓' : 'Publish'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </Section>

      {/* Domain Leaderboard */}
      <Section
        icon={Trophy}
        title="Domain Leaderboard"
        extra={
          <span className="text-[10px] font-bold text-accent bg-accent-dim px-2 py-0.5 rounded-full uppercase tracking-wider">
            Top 5
          </span>
        }
      >
        {tagsLoading ? (
          <Spinner />
        ) : !tags?.length ? (
          <p className="text-[13px] text-text-muted">No data yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5 mt-1">
            {(() => {
              const top5 = tags.slice(0, 5);
              const maxCount = top5[0]?.count || 1;
              return top5.map((tag, idx) => {
                const rank = idx + 1;
                const domKey = tag.domain || (tag.label ? tag.label.replace('#', '') : '');
                const domObj = DOMAINS.find((d) => d.value === domKey);
                const label = domObj ? domObj.label : (tag.label || domKey);
                const color = domObj ? domObj.color : 'var(--accent)';
                const pct = Math.round((tag.count / maxCount) * 100);

                const rankColors = {
                  1: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
                  2: 'bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30',
                  3: 'bg-amber-700/15 text-amber-700 dark:text-amber-500 border-amber-700/30',
                };
                const defaultRankClass = 'bg-surface-2 text-text-muted border-border';
                const rankClass = rankColors[rank] || defaultRankClass;

                return (
                  <div
                    key={tag.label || tag.domain}
                    onClick={() => navigate(`/explore?domain=${domKey}`)}
                    className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-2.5 cursor-pointer transition-all duration-200 hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 group"
                  >
                    {/* Background Progress Bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-500 pointer-events-none rounded-r-lg"
                      style={{ width: `${pct}%`, background: color }}
                    />

                    <div className="relative flex items-center justify-between gap-2 z-1">
                      {/* Left: Rank Badge + Color Dot + Domain Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center border shrink-0 font-mono ${rankClass}`}>
                          {rank}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                          style={{ background: color }}
                        />
                        <span className="text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                          {label}
                        </span>
                      </div>

                      {/* Right: Post count badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-text-primary font-mono">
                          {tag.count}
                        </span>
                        <span className="text-[10px] text-text-muted font-medium">
                          {tag.count === 1 ? 'post' : 'posts'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </Section>

      {/* Top this week */}
      <Section icon={Flame} title="Top This Week">
        {topLoading ? (
          <Spinner />
        ) : !topPosts?.length ? (
          <p className="text-[13px] text-text-muted">No posts yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topPosts.map((post, i) => (
              <div
                key={post._id}
                onClick={() => navigate(`/explore?post=${post._id}`)}
                className="p-2.5 rounded-xl border border-border/50 bg-card hover:bg-hover/60 hover:border-accent/30 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-accent-dim text-accent shrink-0">
                    #{i + 1}
                  </span>
                  <p className="text-[13px] font-semibold text-text-primary leading-[1.35] group-hover:text-accent transition-colors line-clamp-2 m-0">
                    {post.title}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-divider/40">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar name={post.author?.name || 'User'} src={post.author?.avatarUrl} size={16} />
                    <span className="truncate font-medium text-text-secondary">{post.author?.name}</span>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-text-secondary shrink-0">
                    <Heart size={11} className="text-rose-500 fill-rose-500" />
                    {post.likeCount || post.likes?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Friend Suggestions */}
      <Section
        icon={UserCheck}
        title="Friend Suggestions"
        extra={
          <span className="text-[10px] font-semibold text-text-muted/70 bg-surface-2 px-2 py-0.5 rounded-full">
            Suggested
          </span>
        }
      >
        {suggestLoading ? (
          <Spinner />
        ) : !suggestions?.length ? (
          <p className="text-[13px] text-text-muted">No suggestions available right now.</p>
        ) : (
          <div className="flex flex-col gap-2 mt-1">
            {suggestions.map((u) => {
              const isFollowing = Array.isArray(user?.following) && user.following.includes(u._id);
              const domainTag = Array.isArray(u.domain) && u.domain.length > 0 ? u.domain[0] : null;

              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-card hover:bg-hover/60 hover:border-accent/30 transition-all duration-200 group"
                >
                  <Link to={`/profile/${u._id}`} className="flex items-center gap-2.5 flex-1 min-w-0 no-underline">
                    <div className="relative shrink-0">
                      <Avatar name={u.name} src={u.avatarUrl || null} size={36} />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-semibold text-text-primary m-0 group-hover:text-accent transition-colors truncate">
                          {u.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-text-muted m-0 truncate">
                        {domainTag ? `${domainTag} · @${u.username}` : (u.bio || `@${u.username}`)}
                      </p>
                    </div>
                  </Link>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggleFollow(u._id)}
                    className={`px-3 py-1.5 rounded-xl shrink-0 text-[11px] font-semibold cursor-pointer flex items-center gap-1 transition-all duration-150 border ${
                      isFollowing
                        ? 'border-border bg-surface-2 text-text-secondary hover:bg-hover'
                        : 'border-accent bg-accent text-white hover:bg-accent-light shadow-[0_2px_8px_rgba(30,157,241,0.25)]'
                    }`}
                  >
                    {isFollowing ? (
                      <><Check size={12} /> Connected</>
                    ) : (
                      <><UserPlus size={12} /> Connect</>
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Footer */}
      <div className="px-2 pt-1">
        <p className="text-[11px] text-text-muted leading-[1.9]">
          {['About', 'Guidelines', 'Privacy', 'Terms'].map((l, i) => (
            <span key={l}>
              {i > 0 && ' · '}
              <a href="#" className="text-text-muted hover:text-text-secondary transition-colors" onClick={(e) => e.preventDefault()}>
                {l}
              </a>
            </span>
          ))}
        </p>
        <p className="text-[11px] text-text-faint mt-0.5">© 2026 Prograstic</p>
      </div>
    </aside>
  );
}
