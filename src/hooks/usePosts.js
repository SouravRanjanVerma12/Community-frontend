import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

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
