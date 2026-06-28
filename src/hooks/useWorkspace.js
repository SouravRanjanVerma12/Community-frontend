import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';

export function useWorkspaceOverview(postId) {
  return useQuery({
    queryKey: ['workspace', postId, 'overview'],
    queryFn: async () => {
      const { data } = await api.get(`/workspace/${postId}/overview`);
      return data;
    },
    enabled: !!postId,
  });
}

export function useWorkspaceActivity(postId, limit = 5) {
  return useQuery({
    queryKey: ['workspace', postId, 'activity', limit],
    queryFn: async () => {
      const { data } = await api.get(`/workspace/${postId}/activity?limit=${limit}`).catch(() => ({ data: { activities: [] } }));
      return data.activities || [];
    },
    enabled: !!postId,
  });
}

export function useWorkspaceMembers(postId) {
  return useQuery({
    queryKey: ['workspace', postId, 'members'],
    queryFn: async () => {
      const { data } = await api.get(`/workspace/${postId}/members`);
      return data.members;
    },
    enabled: !!postId,
  });
}

export function useWorkspaceResources(postId) {
  return useQuery({
    queryKey: ['workspace', postId, 'resources'],
    queryFn: async () => {
      const { data } = await api.get(`/workspace/${postId}/resources`);
      return data.resources;
    },
    enabled: !!postId,
  });
}

export function useWorkspaceTasks(postId) {
  return useQuery({
    queryKey: ['workspace', postId, 'tasks'],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}/tasks`);
      return data.tasks;
    },
    enabled: !!postId,
  });
}

/* Call after any mutation that changes workspace state (settings saved,
   member invited/removed, resource added/edited/removed, task created/
   updated/deleted) so every tab sharing this postId refetches. */
export function invalidateWorkspace(postId) {
  queryClient.invalidateQueries({ queryKey: ['workspace', postId] });
}
