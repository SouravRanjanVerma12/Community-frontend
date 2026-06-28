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
