import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';

const PAGE_SIZE = 20;

/* Ranked, paginated Explore feed. `asOf` freezes the ranking reference point
   for the whole scroll session (see backend/utils/buildFeedPipeline.js) —
   the server sets it on the first page and every subsequent page echoes it
   back so results stay stable as new posts land mid-session.
   `sort`: 'foryou' (ranked) | 'following' (ranked, followed authors only) |
   'latest' (chronological). */
export function usePostFeed({ domain = 'all', search = '', sort = 'foryou' } = {}) {
  return useInfiniteQuery({
    queryKey: ['posts', domain, search, sort],
    initialPageParam: { page: 1, asOf: null },
    queryFn: async ({ pageParam }) => {
      const params = { page: pageParam.page, limit: PAGE_SIZE, sort };
      if (domain !== 'all') params.domain = domain;
      if (search) params.search = search;
      if (pageParam.asOf) params.asOf = pageParam.asOf;
      const { data } = await api.get('/posts', { params });
      return data; // { posts, hasMore, asOf }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? { page: allPages.length + 1, asOf: lastPage.asOf } : undefined,
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

export function useBookmarkedPosts(enabled = true) {
  return useQuery({
    queryKey: ['posts', 'bookmarked'],
    queryFn: async () => {
      const { data } = await api.get('/posts/bookmarked/me');
      return data.posts;
    },
    enabled,
  });
}

export function invalidateBookmarks() {
  queryClient.invalidateQueries({ queryKey: ['posts', 'bookmarked'] });
}

/* Optimistically adds/removes a post from the cached bookmarked-posts list
   so the Bookmarks tab reflects a toggle without waiting on a refetch. */
export function toggleCachedBookmark(post, bookmarked) {
  queryClient.setQueryData(['posts', 'bookmarked'], (old) => {
    if (!old) return old;
    if (bookmarked) return [post, ...old.filter((p) => p._id !== post._id)];
    return old.filter((p) => p._id !== post._id);
  });
}

/* Every query keyed ['posts', ...] is either the flat-array shape (top,
   bookmarked) or the useInfiniteQuery {pages, pageParams} shape (the main
   feed) — these helpers need to handle both so a single post update/removal
   (edit, like, comment, delete) reaches every list it's cached in. */
function mapPostsEverywhere(old, mapPosts) {
  if (!old) return old;
  if (Array.isArray(old)) return mapPosts(old);
  if (Array.isArray(old.pages)) {
    return { ...old, pages: old.pages.map((page) => ({ ...page, posts: mapPosts(page.posts) })) };
  }
  return old;
}

/* Updates a post in every cached posts list + its singular ['post', id] cache.
   Called after a successful edit (PATCH /posts/:id), which sends the full
   updated post. */
export function updateCachedPost(postId, updatedPost) {
  queryClient.setQueriesData({ queryKey: ['posts'] }, (old) =>
    mapPostsEverywhere(old, (posts) => posts.map((p) => (p._id === postId ? updatedPost : p)))
  );
  queryClient.setQueryData(['post', postId], updatedPost);
}

/* Merges partial fields into a cached post everywhere it appears — for live
   socket updates (post:updated/post:commented/post:commentDeleted) that only
   carry the field(s) that changed, not the whole post. */
export function patchCachedPost(postId, patch) {
  const merge = (p) => (p._id === postId ? { ...p, ...patch } : p);
  queryClient.setQueriesData({ queryKey: ['posts'] }, (old) =>
    mapPostsEverywhere(old, (posts) => posts.map(merge))
  );
  queryClient.setQueryData(['post', postId], (old) => (old ? merge(old) : old));
}

/* Removes a post from every cached posts list + its singular ['post', id] cache.
   Called after a successful delete (DELETE /posts/:id) and for live deletes
   relayed through socketStore. */
export function removeCachedPost(postId) {
  queryClient.setQueriesData({ queryKey: ['posts'] }, (old) =>
    mapPostsEverywhere(old, (posts) => posts.filter((p) => p._id !== postId))
  );
  queryClient.setQueryData(['post', postId], null);
}

/* Prepends a freshly created post to the front of page 1 of a specific feed
   (domain/search/sort) cache — called when the user clicks the "N new posts"
   banner in PostFeed.jsx. */
export function prependCachedPost(domain, search, sort, post) {
  queryClient.setQueryData(['posts', domain, search, sort], (old) => {
    if (!old || !Array.isArray(old.pages) || old.pages.length === 0) return old;
    const [firstPage, ...rest] = old.pages;
    return { ...old, pages: [{ ...firstPage, posts: [post, ...firstPage.posts] }, ...rest] };
  });
}
