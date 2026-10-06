import { apiService } from '@/api/api.service';
import { useAccountStore } from '@/stores/account.store';
import { z } from 'zod';

// Schemas

export const PostContentMark = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

export const PostContent = z.object({
  type: z.string().optional(),
  attrs: z.record(z.string(), z.unknown()).optional(),
  get content() {
    return PostContent.array().optional();
  },
  marks: PostContentMark.array().optional(),
  text: z.string().optional(),
});

export const PostItem = z.object({
  id: z.uuid(),
  access: z.enum(['public', 'gated', 'audience']).nullish(),
  accessGranted: z.boolean().nullish(),
  relativeUrl: z.string().nullish(),
  postCollectionId: z.string().nullish(),
  title: z.string().nullish(),
  content: PostContent.nullish(),
  description: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullish(),
  startAt: z.coerce.date().nullish(),
  endAt: z.coerce.date().nullish(),
  thumbnailImage: z.string().nullish(),
  thumbnailVideo: z.string().nullish(),
  pinned: z.boolean(),
  status: z.string().nullish(),
  hideComments: z.boolean(),
  hideFromFeed: z.boolean(),
  commentCount: z.number().nullish(),
  likeCount: z.number().nullish(),
  likedByMe: z.boolean().nullish(),
});

export const PostList = PostItem.array();

export const PostLike = z.object({
  status: z.string(),
});

export const PlaybackData = z.object({
  jwt: z.string(),
  playbackId: z.string(),
  token: z.string(),
  thumbnailToken: z.string().optional(),
});

// Types

export type PostItem = z.infer<typeof PostItem>;
export type PostList = z.infer<typeof PostList>;
export type PostLike = z.infer<typeof PostLike>;
export type PlaybackData = z.infer<typeof PlaybackData>;

// Payloads

type PostItemPayload = {
  artistId: string;
  id?: string;
  relativeUrl?: string;
  shareSecret?: string;
};

type PostListPayload = {
  artistId: string;
  postCollectionId?: string;
  limit?: number;
  offset?: number;
};

type PostLikePayload = {
  postId: string;
};

type PostDeleteLikePayload = {
  postId: string;
};

type PostPlayPayload = {
  id: string;
  artistId: string;
  postId: string;
  thumbnailTime?: number;
};

// API Calls

export async function getPostItem(params: PostItemPayload, signal?: AbortSignal) {
  const authToken = useAccountStore().authToken;
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/post`,
      params,
      headers,
    },
    PostItem,
    { signal },
  );
}

export async function getPostList(params: PostListPayload, signal?: AbortSignal) {
  const authToken = useAccountStore().authToken;
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/post/list`,
      params,
      headers,
    },
    PostList,
    { signal },
  );
}

export async function doLikePost(data: PostLikePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/post/like`,
      data,
    },
    PostLike,
    { signal, requiresAuth: true },
  );
}

export async function doDeleteLikePost(params: PostDeleteLikePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'DELETE',
      url: `${apiService.openstageApiFan}/post/like`,
      params,
    },
    PostLike,
    { signal, requiresAuth: true },
  );
}

export async function getPostPlay(params: PostPlayPayload, signal?: AbortSignal) {
  const authToken = useAccountStore().authToken;
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/post/playAsset`,
      params,
      headers,
    },
    PlaybackData,
    { signal },
  );
}
