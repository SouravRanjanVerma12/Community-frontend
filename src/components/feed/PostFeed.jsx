import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import { usePosts } from '../../hooks/usePosts';

export default function PostFeed({ domain, search }) {
  const { data: posts, isLoading, isError } = usePosts({ domain, search });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-text-muted">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center px-5 py-12 text-text-muted">
        <p className="text-[15px]">Failed to load posts. Make sure the backend is running.</p>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center px-5 py-15 text-text-muted text-[15px]"
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
        className="flex flex-col gap-3.5"
      >
        {posts.map((post, i) => (
          <PostCard key={post._id} post={post} index={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
