import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import { usePosts } from '../../hooks/usePosts';

export default function PostFeed({ domain, search }) {
  const { data: posts, isLoading, isError } = usePosts({ domain, search });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '15px' }}>Failed to load posts. Make sure the backend is running.</p>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '15px' }}
      >
        No posts yet. Be the first to share something!
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${domain}-${search}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {posts.map((post, i) => (
          <PostCard key={post._id} post={post} index={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
