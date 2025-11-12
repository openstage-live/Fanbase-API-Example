import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchComments as fetchCommentsApi,
  postComment as postCommentApi,
  patchComment as patchCommentApi,
  likeComment as likeCommentApi,
  deleteLikeComment as deleteLikeCommentApi,
  reportComment as reportCommentApi,
  type CommentActionResponse,
} from '@api/comment.api';
import type { Comment } from '@api/comment.api';
import { globalIntervalManager } from '@composables/useIntervalManager';
import { useApiFetcher } from '@/composables/useApiFetcher';
import { useArtistStore } from '@/stores/artist.store';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@/composables/useFanTracking';

type CommentAction = 'reply' | 'edit' | 'report' | 'delete';

interface SelectedCommentData {
  id: string;
  name: string;
  comment: string;
  action: CommentAction;
  parentId?: string;
}

export const useCommentStore = defineStore('comment', () => {
  const postId = ref<string | undefined>(undefined);
  const contentTitle = ref<string | undefined>(undefined);
  const contentReleaseDate = ref<string | undefined>(undefined);

  const isCommentsDialogOpen = ref<boolean>(false);
  const comments = ref<Comment[] | undefined>(undefined);
  const replies = ref<Record<string, Comment[]>>({});

  const isPostingComment = ref<boolean>(false);

  const selectedCommentData = ref<SelectedCommentData | null>(null);
  const openedRepliesStates = ref<string[]>([]);

  const artistStore = useArtistStore();
  const fanStore = useFanStore();
  const fanTracking = useFanTracking();

  // API Fetchers
  const {
    data: commentData,
    error: commentError,
    isFetching: commentIsFetching,
    execute: executeCommentFetch,
  } = useApiFetcher<Comment[]>([], {
    successCallback: (data) => {
      if (data) {
        comments.value = Array.isArray(data) ? data : [];
      }
    },
  });

  const {
    data: replyData,
    error: replyError,
    isFetching: replyIsFetching,
    execute: executeReplyFetch,
  } = useApiFetcher<Comment[]>([], {
    successCallback: (data) => {
      if (data?.[0]?.replyToId) {
        replies.value[data[0].replyToId] = data;
      }
    },
  });

  const {
    data: commentPostData,
    error: commentPostError,
    isFetching: commentPostIsFetching,
    execute: executeCommentPost,
  } = useApiFetcher<Comment | null>(null);

  const {
    data: commentLikeData,
    error: commentLikeError,
    isFetching: commentLikeIsFetching,
    execute: executeCommentLike,
  } = useApiFetcher<CommentActionResponse | null>(null);

  const {
    data: commentDeleteLikeData,
    error: commentDeleteLikeError,
    isFetching: commentDeleteLikeIsFetching,
    execute: executeCommentDeleteLike,
  } = useApiFetcher<CommentActionResponse | null>(null);

  const {
    data: commentReportData,
    error: commentReportError,
    isFetching: commentReportisFetching,
    execute: executeCommentReport,
  } = useApiFetcher<CommentActionResponse | null>(null);

  const {
    data: commentPatchData,
    error: commentPatchError,
    isFetching: commentPatchIsFetching,
    execute: executeCommentPatch,
  } = useApiFetcher<Comment | null>(null);

  const setSelectedCommentData = (
    id: string,
    name: string,
    comment: string,
    action: CommentAction,
    parentId?: string,
  ) => {
    selectedCommentData.value = {
      id,
      name,
      comment,
      action,
      parentId,
    };
  };

  const clearSelectedCommentData = () => {
    selectedCommentData.value = null;
  };

  const addOpenedReply = (replyId: string) => {
    openedRepliesStates.value = [];
    openedRepliesStates.value.push(replyId);
  };

  const removeOpenedReply = (replyId: string) => {
    const index = openedRepliesStates.value.indexOf(replyId);
    if (index > -1) {
      openedRepliesStates.value.splice(index, 1);
    }
  };

  const clearOpenedReplies = () => {
    openedRepliesStates.value = [];
  };

  const clearRepliesById = (commentId: string) => {
    if (replies.value[commentId]) {
      delete replies.value[commentId];
    }
  };

  const isReportCommentActive = computed(() => selectedCommentData.value?.action === 'report');
  const isDeleteCommentActive = computed(() => {
    const isActive = selectedCommentData.value?.action === 'delete';

    return isActive;
  });

  const replyToId = computed(() =>
    selectedCommentData.value?.action === 'reply'
      ? selectedCommentData.value.parentId || selectedCommentData.value.id
      : undefined,
  );
  const replyToCommentName = computed(() =>
    selectedCommentData.value?.action === 'reply' ? selectedCommentData.value.name : undefined,
  );
  const replyToComment = computed(() =>
    selectedCommentData.value?.action === 'reply' ? selectedCommentData.value.comment : undefined,
  );

  const reportToId = computed(() =>
    selectedCommentData.value?.action === 'report' ? selectedCommentData.value.id : undefined,
  );
  const reportToCommentName = computed(() =>
    selectedCommentData.value?.action === 'report' ? selectedCommentData.value.name : undefined,
  );
  const reportToComment = computed(() =>
    selectedCommentData.value?.action === 'report' ? selectedCommentData.value.comment : undefined,
  );

  const editToId = computed(() =>
    selectedCommentData.value?.action === 'edit' ? selectedCommentData.value.id : undefined,
  );
  const editToCommentName = computed(() =>
    selectedCommentData.value?.action === 'edit' ? selectedCommentData.value.name : undefined,
  );
  const editToComment = computed(() =>
    selectedCommentData.value?.action === 'edit' ? selectedCommentData.value.comment : undefined,
  );

  const setReportCommentForm = (payload: boolean) => {
    if (!payload && selectedCommentData.value?.action === 'report') {
      clearSelectedCommentData();
    }
  };

  const setDeleteCommentForm = (payload: boolean) => {
    if (!payload && selectedCommentData.value?.action === 'delete') {
      clearSelectedCommentData();
    }
  };

  const clearFormData = () => {
    if (
      selectedCommentData.value?.action === 'reply' ||
      selectedCommentData.value?.action === 'report' ||
      selectedCommentData.value?.action === 'edit'
    ) {
      clearSelectedCommentData();
    }
  };

  const openCommentDialog = async (isOpen: boolean, id: string, title: string, date: string) => {
    postId.value = id;

    // Open immediately to keep focus within the original user gesture on iOS Safari
    isCommentsDialogOpen.value = isOpen;
    contentTitle.value = title;
    contentReleaseDate.value = date;

    // Fetch comments after opening
    await fetchComments(id);
  };

  const closeCommentDialog = () => {
    isCommentsDialogOpen.value = false;

    postId.value = undefined;
    contentTitle.value = undefined;
    contentReleaseDate.value = undefined;

    comments.value = [];
    replies.value = {};

    clearFormData();
    clearOpenedReplies();
  };

  const fetchComments = async (postId?: string) => {
    if (!postId) return;
    await executeCommentFetch((signal) => fetchCommentsApi({ postId }, signal));
  };

  const fetchReplies = async (postId?: string, replyToId?: string) => {
    if (!postId || !replyToId) return;
    await executeReplyFetch((signal) => fetchCommentsApi({ postId, replyToId }, signal));
  };

  const postComment = async (postId?: string, comment?: string, replyToId?: string) => {
    if (!postId || !comment) return;

    isPostingComment.value = true;

    globalIntervalManager.pauseAllIntervals();

    const result = await executeCommentPost((signal) =>
      postCommentApi({ postId, comment, replyToId, artistId: artistStore.id }, signal),
    );

    if (result.success && result.data) {
      if (result.data.replyToId) {
        fanTracking.trackCommentReplied({
          post_id: result.data.postId,
          comment_id: result.data.id,
          reply_id: result.data.replyToId,
          fan_id: result.data.fanId,
        });
      } else {
        fanTracking.trackPostCommented({
          post_id: result.data.postId,
          comment_id: result.data.id,
          fan_id: result.data.fanId,
        });
      }
    }

    if (replyToId) {
      await fetchReplies(postId, replyToId);
    } else {
      await fetchComments(postId);
    }

    isPostingComment.value = false;
    globalIntervalManager.resumeAllIntervals();
  };

  const likeComment = async (id?: string) => {
    if (!id) return;
    const result = await executeCommentLike((signal) => likeCommentApi({ commentId: id }, signal));

    if (result.success) {
      fanTracking.trackCommentLiked({
        post_id: postId.value,
        comment_id: id,
        fan_id: fanStore.fanId,
      });
    }
  };

  const deleteLikeComment = async (id?: string) => {
    if (!id) return;
    const result = await executeCommentDeleteLike((signal) =>
      deleteLikeCommentApi({ commentId: id }, signal),
    );

    if (result.success) {
      fanTracking.trackCommentUnliked({
        post_id: postId.value,
        comment_id: id,
        fan_id: fanStore.fanId,
      });
    }
  };

  const reportComment = async (id?: string, reason?: string, url?: string) => {
    if (!id || !reason || !url) return;
    await executeCommentReport((signal) =>
      reportCommentApi({ commentId: id, reason, url }, signal),
    );
  };

  const patchComment = async (commentId?: string, comment?: string) => {
    if (!commentId || comment === undefined) return;
    await executeCommentPatch((signal) => patchCommentApi({ commentId, comment }, signal));
  };

  return {
    postId,
    contentTitle,
    contentReleaseDate,

    // New unified approach
    selectedCommentData,
    setSelectedCommentData,
    clearSelectedCommentData,

    // Opened replies management
    openedRepliesStates,
    addOpenedReply,
    removeOpenedReply,
    clearOpenedReplies,
    clearRepliesById,

    // Interval pause state
    isPostingComment,

    // Computed properties for backward compatibility
    isReportCommentActive,
    isDeleteCommentActive,

    isCommentsDialogOpen,
    comments,
    replies,
    openCommentDialog,
    closeCommentDialog,

    // Backward compatibility getters
    replyToId,
    replyToCommentName,
    replyToComment,
    reportToId,
    reportToCommentName,
    reportToComment,
    editToId,
    editToCommentName,
    editToComment,

    clearFormData,
    setReportCommentForm,
    setDeleteCommentForm,

    commentData,
    commentError,
    commentIsFetching,
    fetchComments,

    replyData,
    replyError,
    replyIsFetching,
    fetchReplies,

    commentPostData,
    commentPostError,
    commentPostIsFetching,
    postComment,

    commentLikeData,
    commentLikeError,
    commentLikeIsFetching,
    likeComment,

    commentDeleteLikeData,
    commentDeleteLikeError,
    commentDeleteLikeIsFetching,
    deleteLikeComment,

    commentReportData,
    commentReportError,
    commentReportisFetching,
    reportComment,

    commentPatchData,
    commentPatchError,
    commentPatchIsFetching,
    patchComment,
  };
});
