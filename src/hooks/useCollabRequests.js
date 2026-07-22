import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

/* Used by CollabRequesters — lazily fetched the first time the list is
   expanded, then cached. `isCreator` switches between the full applicant
   list (creator-only) and the public requester list. */
export function useCollabRequesters(postId, isCreator, enabled) {
  return useQuery({
    queryKey: ['collab-requesters', postId, isCreator],
    queryFn: async () => {
      const endpoint = isCreator ? `/posts/${postId}/requests` : `/posts/${postId}/requesters`;
      const { data } = await api.get(endpoint);
      return isCreator ? data.requests : data.requesters;
    },
    enabled: enabled && !!postId,
  });
}

/* Raw list of the user's own collab requests (any status) — same query key
   as the requestsQuery inside useMyWorkspaces (useWorkspace.js), so calling
   both hooks together shares one cached fetch instead of double-requesting. */
export function useMyCollabRequests(userId) {
  return useQuery({
    queryKey: ['my-collab-requests-workspace'],
    queryFn: async () => {
      const { data } = await api.get('/collab-requests/my');
      return data.requests;
    },
    enabled: !!userId,
  });
}
