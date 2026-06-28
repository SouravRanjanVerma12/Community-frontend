import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get('/friends');
      return data.friends;
    },
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['friends', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/friends/pending');
      return data.requests;
    },
  });
}

export function useFriendStatus(userId) {
  return useQuery({
    queryKey: ['friends', 'status', userId],
    queryFn: async () => {
      const { data } = await api.get(`/friends/status/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

/* Call after any mutation that changes friendship state
   (send/accept/cancel/remove request) so every consumer refetches. */
export function invalidateFriends() {
  queryClient.invalidateQueries({ queryKey: ['friends'] });
}
