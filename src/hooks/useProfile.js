import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

export function useUserProfile(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data.user;
    },
    enabled: !!userId,
  });
}

export function useUserPosts(userId) {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/posts`);
      return data.posts;
    },
    enabled: !!userId,
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const { data } = await api.get('/users/suggestions');
      return data.users;
    },
    retry: false,
  });
}
