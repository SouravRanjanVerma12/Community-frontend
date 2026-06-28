import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';

export function useProjects(userId, isOwnProfile) {
  return useQuery({
    queryKey: ['projects', userId, isOwnProfile],
    queryFn: async () => {
      const endpoint = isOwnProfile ? '/projects' : `/users/${userId}/projects`;
      try {
        const { data } = await api.get(endpoint);
        return data.projects || [];
      } catch (err) {
        if (err.response?.status === 404) return []; // backend not ready — empty list, no error
        throw err;
      }
    },
    enabled: !!userId,
  });
}

export function invalidateProjects(userId, isOwnProfile) {
  queryClient.invalidateQueries({ queryKey: ['projects', userId, isOwnProfile] });
}
