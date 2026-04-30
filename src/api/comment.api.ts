import { apiService } from '@/api/api.service';
import { z } from 'zod';

type CommentGetPayload = {
  artistId: string;
  postId?: string;
  replyToId?: string;
};

type CommentPostPayload = {
  artistId: string;
  postId?: string;
  comment?: string;
  replyToId?: string;
};

type CommentPatchPayload = {
  commentId: string;
  comment: string;
};

type CommentLikePayload = {
  commentId: string;
};

type CommentReportPayload = {
  commentId: string;
  reason: string;
  url: string;
};

export type Comment = z.infer<typeof CommentSchema>;
export type CommentActionResponse = z.infer<typeof CommentActionResponse>;

export const CommentSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  fanId: z.string(),
  postId: z.string(),
  createdAt: z.string(),
  comment: z.string(),
  name: z.string(),
  likeCount: z.number(),
  likedByMe: z.boolean(),
  replyCount: z.number(),
  teamComment: z.boolean(),
  replyToId: z.string().optional(),
  avatarUrl: z.string().optional(),
  isHighlighted: z.boolean().optional(),
});

const CommentList = z.array(CommentSchema);

const CommentActionResponse = z.object({
  status: z.string(),
});

export async function fetchComments(params: CommentGetPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/comment`,
      params,
    },
    CommentList,
    { signal, requiresAuth: true },
  );
}

export async function postComment(params: CommentPostPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/comment`,
      data: params,
    },
    CommentSchema,
    { signal, requiresAuth: true },
  );
}

export async function patchComment(params: CommentPatchPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'PATCH',
      url: `${apiService.openstageApiFan}/comment`,
      data: params,
    },
    CommentSchema,
    { signal, requiresAuth: true },
  );
}

export async function likeComment(params: CommentLikePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/comment/like`,
      data: params,
    },
    CommentActionResponse,
    { signal, requiresAuth: true },
  );
}

export async function deleteLikeComment(params: CommentLikePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'DELETE',
      url: `${apiService.openstageApiFan}/comment/like`,
      params,
    },
    CommentActionResponse,
    { signal, requiresAuth: true },
  );
}

export async function reportComment(params: CommentReportPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/comment/report`,
      data: params,
    },
    CommentActionResponse,
    { signal, requiresAuth: true },
  );
}
