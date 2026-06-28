import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';

export function usePosts({ domain = 'all', search = '' } = {}) {
  return useQuery({
    queryKey: ['posts', domain, search],
    queryFn: async () => {
      const params = {};
      if (domain !== 'all') params.domain = domain;
      if (search) params.search = search;
      const { data } = await api.get('/posts', { params });
      return data.posts;
    },
  });
}

export function usePost(postId) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}`).catch(() => ({ data: { post: null } }));
      return data.post ?? data;
    },
    enabled: !!postId,
  });
}

export function useTopPosts() {
  return useQuery({
    queryKey: ['posts', 'top'],
    queryFn: async () => {
      const { data } = await api.get('/posts/top');
      return data.posts;
    },
  });
}

export function useTrendingTags() {
  return useQuery({
    queryKey: ['posts', 'trending-tags'],
    queryFn: async () => {
      const { data } = await api.get('/posts/trending-tags');
      return data.tags;
    },
  });
}

/* Updates a post in every cached posts list + its singular ['post', id] cache.
   Called after a successful edit (PATCH /posts/:id). */
export function updateCachedPost(postId, updatedPost) {
  queryClient.setQueriesData({ queryKey: ['posts'] }, (old) =>
    Array.isArray(old) ? old.map((p) => (p._id === postId ? updatedPost : p)) : old
  );
  queryClient.setQueryData(['post', postId], updatedPost);
}

/* Removes a post from every cached posts list + its singular ['post', id] cache.
   Called after a successful delete (DELETE /posts/:id). */
export function removeCachedPost(postId) {
  queryClient.setQueriesData({ queryKey: ['posts'] }, (old) =>
    Array.isArray(old) ? old.filter((p) => p._id !== postId) : old
  );
  queryClient.setQueryData(['post', postId], null);
}
