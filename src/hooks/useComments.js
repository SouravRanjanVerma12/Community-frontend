import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';

export function useComments(postId, enabled) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}/comments`);
      return data.comments;
    },
    enabled: enabled && !!postId,
  });
}

/* Called from the post:commented socket handler to append a live comment
   to the cache without an extra round trip — only has an effect if the
   comments list has already been fetched (cache entry exists). */
export function appendCachedComment(postId, comment) {
  queryClient.setQueryData(['comments', postId], (prev) => prev ? [...prev, comment] : prev);
}

/* Called after a successful comment delete (or the post:commentDeleted socket
   event) to remove it from the cache without an extra round trip. */
export function removeCachedComment(postId, commentId) {
  queryClient.setQueryData(['comments', postId], (prev) =>
    prev ? prev.filter((c) => c._id !== commentId) : prev
  );
}
