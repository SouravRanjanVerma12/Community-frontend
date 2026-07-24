import { useQuery, useQueries } from '@tanstack/react-query';
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

export function useWorkspaceEndorsements(postId) {
  return useQuery({
    queryKey: ['workspace', postId, 'endorsements'],
    queryFn: async () => {
      const { data } = await api.get(`/workspace/${postId}/endorsements`);
      return data; // { endorsements, isOwner }
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

/* Projects the user leads or has been accepted into — same query keys as
   CollabPage's Workspace tab, so the navbar dropdown and that tab share
   one cache instead of double-fetching. */
export function useMyWorkspaces(userId) {
  const requestsQuery = useQuery({
    queryKey: ['my-collab-requests-workspace'],
    queryFn: async () => {
      const { data } = await api.get('/collab-requests/my');
      return data.requests;
    },
    enabled: !!userId,
  });

  const postsQuery = useQuery({
    queryKey: ['my-collab-posts-ws', userId],
    queryFn: async () => {
      const { data } = await api.get('/posts', { params: { type: 'collab', author: userId, limit: 20 } });
      return data.posts;
    },
    enabled: !!userId,
  });

  const accepted = (requestsQuery.data ?? []).filter((r) => r.status === 'accepted' && r.post);
  const myPosts  = postsQuery.data ?? [];

  const workspaces = [
    ...myPosts.map((p) => ({ id: p._id, title: p.projectName || p.title, role: 'Lead', domain: p.domain })),
    ...accepted.map((r) => ({ id: r.post._id, title: r.post.projectName || r.post.title, role: 'Member', domain: r.post.domain })),
  ];

  return {
    workspaces,
    isLoading: requestsQuery.isLoading || postsQuery.isLoading,
    isError: requestsQuery.isError || postsQuery.isError,
  };
}

/* Task counts summed across every workspace in `workspaces` (the array
   useMyWorkspaces returns). Same query key per-workspace as
   useWorkspaceOverview, so a workspace already visited this session is a
   cache hit rather than a new request. */
export function useMyWorkspaceTaskStats(workspaces) {
  const results = useQueries({
    queries: workspaces.map((w) => ({
      queryKey: ['workspace', w.id, 'overview'],
      queryFn: async () => {
        const { data } = await api.get(`/workspace/${w.id}/overview`);
        return data;
      },
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const taskStats = results.reduce(
    (totals, r) => {
      const s = r.data?.taskStats;
      if (!s) return totals;
      return {
        todo: totals.todo + (s.todo || 0),
        in_progress: totals.in_progress + (s.in_progress || 0),
        done: totals.done + (s.done || 0),
      };
    },
    { todo: 0, in_progress: 0, done: 0 },
  );

  return { taskStats, isLoading };
}
