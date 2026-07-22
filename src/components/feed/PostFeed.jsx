import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowUp, UsersRound } from 'lucide-react';
import PostCard from './PostCard';
import { usePostFeed, prependCachedPost } from '../../hooks/usePosts';
import { useAuthStore } from '../../stores/authStore';
import { getSocket } from '../../stores/socketStore';

const FEED_TABS = [
  { id: 'foryou', label: 'For You' },
  { id: 'following', label: 'Following', authOnly: true },
  { id: 'latest', label: 'Latest' },
];

export default function PostFeed({ domain, search, authorDomain = null }) {
  const { user } = useAuthStore();
  const [sort, setSort] = useState('foryou');
  const {
    data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = usePostFeed({ domain, search, sort, authorDomain });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const tabs = FEED_TABS.filter((t) => !t.authOnly || user);

  // "N new posts" banner — click-to-insert, no auto-prepend/scroll-yank.
  // Own posts are excluded: CreatePost.jsx already invalidates the feed
  // directly on a successful submit, so the author sees their post without
  // needing the banner too.
  const [pendingPosts, setPendingPosts] = useState([]);

  useEffect(() => {
    setPendingPosts([]); // filters changed — stale pending posts no longer apply
    if (search) return; // relevance semantics differ under an active text search; skip

    const socket = getSocket();
    if (!socket) return;

    const onCreated = ({ post }) => {
      if (post.author?._id === user?._id) return;
      if (domain !== 'all' && post.domain !== domain) return;
      if (sort === 'following' && !user?.following?.includes(post.author?._id)) return;
      setPendingPosts((prev) => [...prev, post]);
    };

    socket.on('post:created', onCreated);
    return () => socket.off('post:created', onCreated);
  }, [domain, search, sort, authorDomain, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const showPendingPosts = () => {
    pendingPosts.forEach((post) => prependCachedPost(domain, search, sort, post));
    setPendingPosts([]);
  };

  // Infinite scroll sentinel
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasNextPage) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tabBar = (
    <div className="w-full justify-around flex items-center gap-1 bg-card border border-card-border rounded-xl p-1 w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setSort(t.id)}
          className={[
            'w-full px-3.5 py-1.5 rounded-lg border-none text-[13px] font-semibold cursor-pointer transition-colors duration-150',
            sort === t.id ? 'bg-accent-dim text-accent' : 'bg-transparent text-text-muted hover:text-text-secondary',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}``
    </div>
  );

  let body;
  if (isLoading) {
    body = (
      <div className="flex justify-center py-12 text-text-muted">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  } else if (isError) {
    body = (
      <div className="text-center px-5 py-12 text-text-muted">
        <p className="text-[15px]">Failed to load posts. Make sure the backend is running.</p>
      </div>
    );
  } else if (!posts.length) {
    body = sort === 'following' ? (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center px-5 py-15 text-text-muted text-[15px] flex flex-col items-center gap-2"
      >
        <UsersRound size={28} className="opacity-40" />
        Posts from people you follow will show up here. Follow someone to get started!
      </motion.div>
    ) : (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center px-5 py-15 text-text-muted text-[15px]"
      >
        No posts yet. Be the first to share something!
      </motion.div>
    );
  } else {
    body = (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${domain}-${search}-${sort}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3.5"
        >
          <AnimatePresence>
            {pendingPosts.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                onClick={showPendingPosts}
                className="flex items-center justify-center gap-1.5 mx-auto px-4 py-2 rounded-full border-none bg-accent text-white text-[13px] font-semibold cursor-pointer shadow-btn"
              >
                <ArrowUp size={14} />
                {pendingPosts.length === 1 ? '1 new post' : `${pendingPosts.length} new posts`}
              </motion.button>
            )}
          </AnimatePresence>

          {posts.map((post, i) => (
            <PostCard key={post._id} post={post} index={i} />
          ))}

          <div ref={sentinelRef} className="h-1" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4 text-text-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {tabBar}
      {body}
    </div>
  );
}
