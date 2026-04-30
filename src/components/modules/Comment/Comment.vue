<template>
  <div>
    <CommentInner
      ref="commentInnerRef"
      class="border-b border-black/15 pb-4 last-of-type:border-none"
      :comment="comment"
      :is-replies-fetching="repliesStates[comment.id as string]?.isFetching"
      :is-reply-form-open="repliesStates[comment.id as string]?.isOpen"
      :reply-count="replies?.length"
      @close-replies="closeReplies"
      @set-reply-form="
        setReplyForm(comment.id, comment.name, comment.comment, comment.replyCount, comment.id)
      "
    />
    <transition name="fade" mode="out-in">
      <div
        v-if="replies && repliesStates[comment.id as string]?.isOpen"
        class="replied-comments-wrapper grid gap-y-4 border-t border-black/10 py-4 pl-5 last-of-type:border-none lg:pl-5"
      >
        <CommentInner
          v-for="repliedComment in replies"
          :key="repliedComment.id"
          :ref="
            (el) => {
              repliedCommentRefs[repliedComment.id as string] = el as InstanceType<
                typeof CommentInner
              >;
            }
          "
          class="border-b border-black/10 pb-4"
          :comment="repliedComment"
          :is-replies-fetching="repliesStates[repliedComment.id as string]?.isFetching"
          @set-reply-form="
            setReplyForm(
              repliedComment.id,
              repliedComment.name,
              repliedComment.comment,
              repliedComment.replyCount,
              comment.id,
            )
          "
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useCommentStore } from '@stores/comment.store';
import { globalIntervalManager } from '@composables/useIntervalManager';

// Interfaces
import type { Comment } from '@api/comment.api';

// Components
import CommentInner from '@modules/Comment/CommentInner.vue';

// Props
const props = defineProps<{
  comment: Comment;
  postId?: string;
}>();

// Refs
const replies = ref<Comment[] | null>(null);
const repliesStates = ref<Record<string, { isFetching: boolean; isOpen: boolean }>>({});
const commentInnerRef = ref<InstanceType<typeof CommentInner> | null>(null);
const repliedCommentRefs = ref<Record<string, InstanceType<typeof CommentInner> | null>>({});

// Stores
const commentStore = useCommentStore();

// Interval management
let repliesRefreshInterval: number | null = null;

// Methods
const highlightComment = () => {
  commentInnerRef.value?.highlightComment();
};

const setReplyForm = async (
  replyToId: Comment['replyToId'],
  name: Comment['name'],
  comment: Comment['comment'],
  _replyCount: Comment['replyCount'],
  parentId: Comment['id'],
) => {
  const replyId = String(replyToId);

  if (!repliesStates.value[replyId]) {
    repliesStates.value[replyId] = { isFetching: false, isOpen: false };
  }

  commentStore.setSelectedCommentData(
    replyId,
    String(name),
    String(comment),
    'reply',
    String(parentId),
  );

  if (!repliesStates.value[replyId].isOpen) {
    repliesStates.value[replyId].isFetching = true;
    await fetchReplies();
    repliesStates.value[replyId].isFetching = false;
  }
};

const closeReplies = () => {
  repliesStates.value[props.comment.id as string] = { isFetching: false, isOpen: false };

  commentStore.clearSelectedCommentData();
  commentStore.clearRepliesById(props.comment.id as string);

  stopRepliesRefresh();
};

const fetchReplies = async () => {
  await commentStore.fetchReplies(props.postId, props.comment.id);
  replies.value = commentStore.replies[props.comment.id as string] || [];

  if (replies.value && replies.value.length > 0) {
    repliesStates.value[props.comment.id as string] = { isFetching: false, isOpen: true };
  } else {
    repliesStates.value[props.comment.id as string] = { isFetching: false, isOpen: false };
  }
};

const refreshReplies = async () => {
  if (repliesStates.value[props.comment.id as string]?.isOpen) {
    await fetchReplies();
  }
};

const startRepliesRefresh = () => {
  if (repliesRefreshInterval) {
    globalIntervalManager.removeInterval(repliesRefreshInterval);
  }
  if (!commentStore.isPostingComment) {
    repliesRefreshInterval = globalIntervalManager.addInterval(
      refreshReplies,
      5000,
      'CommentReplies',
    );
  }
};

const stopRepliesRefresh = () => {
  if (repliesRefreshInterval) {
    globalIntervalManager.removeInterval(repliesRefreshInterval);
    repliesRefreshInterval = null;
  }
};

// Watchers
watch(
  () => repliesStates.value[props.comment.id as string]?.isOpen,
  (isOpen) => {
    if (isOpen) {
      startRepliesRefresh();
    } else {
      stopRepliesRefresh();
    }
  },
);

watch(
  () => commentStore.isPostingComment,
  (isPosting) => {
    if (isPosting) {
      stopRepliesRefresh();
    } else {
      if (repliesStates.value[props.comment.id as string]?.isOpen) {
        startRepliesRefresh();
      }
    }
  },
);

// Unmount
onUnmounted(() => {
  stopRepliesRefresh();
});

// Expose
defineExpose({
  fetchReplies,
  setReplyForm,
  highlightComment,
  closeReplies,
});
</script>
