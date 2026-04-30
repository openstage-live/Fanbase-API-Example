<template>
  <div>
    <div>
      <div class="flex w-full items-center justify-between">
        <span class="mb-2 text-lg font-bold dark:text-white">
          {{ t('comments.deleteComment') }}
        </span>
        <CircleX
          :size="18"
          @click="commentStore.setDeleteCommentForm(false)"
          class="cursor-pointer"
          stroke="white"
        />
      </div>
    </div>
    <p class="mb-4 text-sm dark:text-white/60">{{ t('comments.deleteCommentSubtitle') }}</p>
    <InfoBar
      v-if="commentStore.commentError"
      variant="destructive"
      :title="commentStore.commentError"
    />
    <div class="flex flex-col gap-y-4">
      <Button :disabled="isDeleting" @click="confirmDelete">
        <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin stroke-white" />
        {{ t('comments.confirmDelete') }}
      </Button>
      <Button variant="link" size="sm" @click="commentStore.setDeleteCommentForm(false)">
        {{ t('comments.cancel') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { useCommentStore } from '@stores/comment.store';

// Components
import InfoBar from '@generics/InfoBar.vue';

// Types
import type { ComponentPublicInstance } from 'vue';
type CommentComponentInstance = ComponentPublicInstance & {
  fetchReplies?: () => Promise<void>;
  closeReplies?: () => void;
};

// Props
const props = defineProps<{
  placeholder?: string;
  buttonLabel?: string;
  error?: string;
  commentRefs?: Record<string, CommentComponentInstance | null>;
}>();

// Components
import Button from '@ui/button/Button.vue';

// Icons
import { CircleX, Loader2 } from 'lucide-vue-next';

// Composables
const { t } = useTranslation();

// Stores
const commentStore = useCommentStore();

// Refs
const isDeleting = ref(false);

// Computed
const selectedComment = computed(() => {
  return commentStore.selectedCommentData;
});
const replyToId = computed(() => {
  return commentStore.selectedCommentData?.parentId;
});
const isDelete = computed(() => {
  return commentStore.selectedCommentData?.action === 'delete';
});

const refreshComments = async (postId: string, replyId: string) => {
  await commentStore.fetchReplies(postId, replyId);

  if (props.commentRefs && replyId) {
    const parentComment = props.commentRefs[replyId];
    if (parentComment && parentComment.fetchReplies) {
      await parentComment.fetchReplies();
    }
  }
};

const closeRepliesForComment = (replyId: string) => {
  if (props.commentRefs && replyId) {
    const parentComment = props.commentRefs[replyId];

    if (parentComment && parentComment.closeReplies) {
      parentComment.closeReplies();
    }
  }
};

// Methods
const confirmDelete = async () => {
  isDeleting.value = true;

  const postId = commentStore.postId;

  try {
    if (!selectedComment.value?.id || !isDelete.value) return;
    await commentStore.patchComment(selectedComment.value.id, '');

    if (replyToId.value) {
      await refreshComments(postId as string, selectedComment.value.parentId as string);
    } else {
      await commentStore.fetchComments(postId);
      closeRepliesForComment(selectedComment.value.id);
    }

    commentStore.clearSelectedCommentData();
  } catch (error) {
    console.error('Error deleting comment:', error);
  } finally {
    isDeleting.value = false;
  }
};
</script>
