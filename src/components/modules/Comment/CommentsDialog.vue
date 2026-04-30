<template>
  <Dialog ref="commentsDialog" :open="isOpen" @update:open="togglePopover" class="hidden">
    <DialogContent
      class="comments-dialog-content dark bottom-0 h-full w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-0 rounded-bl-none rounded-br-none bg-black/70 p-0 sm:bottom-[unset] sm:h-auto sm:w-auto sm:rounded-xl lg:w-[33dvw]"
    >
      <DialogHeader class="pb- px-6 pt-6">
        <DialogDescription class="text-left font-Matter-Medium uppercase">
          {{ date }}
        </DialogDescription>
        <DialogTitle class="-mt-1 text-left font-Matter-Medium uppercase">{{ title }}</DialogTitle>
      </DialogHeader>
      <div
        ref="commentWrapper"
        class="relative mt-4 overflow-y-auto px-4 pb-6 focus-visible:outline-none lg:px-6"
      >
        <div
          v-if="commentStore.commentIsFetching && !hasInitiallyLoaded"
          class="flex items-center justify-center py-20"
        >
          <Loader2 class="h-8 w-8 animate-spin stroke-white" />
        </div>
        <div v-if="hasValidComments" class="mt-4 grid gap-y-5">
          <Comment
            v-for="comment in comments"
            :key="comment.id"
            :ref="(el) => comment.id && setCommentRef(el, comment.id)"
            :comment="comment"
            :post-id="postId"
          />
        </div>
        <div
          v-else-if="!hasValidComments && hasInitiallyLoaded"
          class="flex h-full flex-col items-center justify-center px-8 pb-0 pt-4 md:pb-8"
        >
          <div class="relative flex flex-col items-center px-12 py-10 md:py-12">
            <span class="font-Matter text-3xl text-white md:text-4xl">
              {{ t('comments.emptyState.get') }}
            </span>
            <span class="font-Matter text-3xl text-white md:text-4xl">
              {{ t('comments.emptyState.chattin') }}
            </span>
          </div>
        </div>
      </div>
      <DialogFooter class="border-t border-black/10 px-4 pb-6 pt-4 dark:border-white/10 lg:px-6">
        <div class="flex w-full flex-col">
          <div
            v-if="(!commentStore.isReportCommentActive && isReplyComment) || isEditComment"
            class="w-full pb-2"
          >
            <div
              class="flex w-full items-center justify-between gap-x-4"
              :class="isReplyComment ? 'mb-2' : 'mb-0'"
            >
              <span class="text-lg font-bold dark:text-white">{{ formLabel }}</span>
              <CircleX
                :size="18"
                @click="clearFormData"
                class="min-h-4 min-w-4 cursor-pointer"
                stroke="white"
              />
            </div>
          </div>
          <CommentDeleteForm
            v-if="commentStore.selectedCommentData?.action === 'delete'"
            :comment-refs="commentRefs"
          />
          <CommentReportForm v-if="commentStore.selectedCommentData?.action === 'report'" />
          <div class="relative">
            <div v-if="isReplyComment" class="absolute left-4 top-4 z-10 flex">
              <span class="mb-1 block text-xs dark:text-white">
                <span class="font-Matter-SemiBold uppercase opacity-65 dark:text-white">
                  {{ t('comments.replyingTo') }}&nbsp;
                </span>
                <span class="font-Matter-Bold uppercase dark:text-white">
                  {{ commentStore.replyToCommentName || commentStore.editToCommentName }}
                </span>
              </span>
            </div>
            <CommentForm
              v-if="!commentStore.isReportCommentActive && !commentStore.isDeleteCommentActive"
              ref="commentFormRef"
              :error="formError"
              :comment-refs="commentRefs"
            />
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { useCommentStore } from '@stores/comment.store';
import type { ComponentPublicInstance } from 'vue';
import { globalIntervalManager } from '@composables/useIntervalManager';

// Interfaces
import type { Comment as CommentType } from '@api/comment.api';

// Types
type CommentFormInstance = ComponentPublicInstance & {
  focus: () => void;
};

type CommentComponentInstance = ComponentPublicInstance;

// Components
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from '@ui/dialog';
import Comment from '@modules/Comment/Comment.vue';
import CommentForm from '@modules/Comment/CommentForm.vue';
import CommentReportForm from '@modules/Comment/CommentReportForm.vue';
import CommentDeleteForm from '@modules/Comment/CommentDeleteForm.vue';

// Icons
import { CircleX, Loader2 } from 'lucide-vue-next';

// Props
defineProps<{
  postId?: string;
  title?: string;
  date?: string;
  id?: string;
}>();

// Composables
const { t } = useTranslation();

// Stores
const commentStore = useCommentStore();

// Element refs
const commentFormRef = ref<CommentFormInstance | null>(null);
const commentWrapper = ref<HTMLElement | null>(null);
const commentRefs = ref<Record<string, CommentComponentInstance | null>>({});

// Models
const isOpen = defineModel<boolean>('modelValue', {
  required: true,
});

const comments = defineModel<CommentType[]>('comments', {
  required: true,
});

// Interval management
let commentRefreshInterval: number | null = null;
const hasInitiallyLoaded = ref<boolean>(false);

// Computeds
const isReplyComment = computed(() => commentStore.replyToId);
const isEditComment = computed(() => commentStore.editToId);
const formLabel = computed(() => {
  if (commentStore.selectedCommentData?.action === 'edit') {
    return t('comments.editComment');
  }
  if (commentStore.selectedCommentData?.action === 'reply') {
    return t('comments.replyToComment');
  }
  return '';
});
const hasValidComments = computed(() => {
  if (!comments.value || comments.value.length === 0) return false;
  return comments.value.some((comment) => comment.comment && comment.comment.trim().length > 0);
});
const formError = computed(() => commentStore.commentError || commentStore.replyError || undefined);

// Methods
const focusInput = () => {
  if (commentFormRef.value) commentFormRef.value?.focus();
};

const clearFormData = async () => {
  commentStore.clearSelectedCommentData();
  focusInput();
};

const togglePopover = () => {
  commentStore.closeCommentDialog();
  isOpen.value = !isOpen.value;
  hasInitiallyLoaded.value = false;
};

const setCommentRef = (el: Element | ComponentPublicInstance | null, commentId: string) => {
  if (el) {
    commentRefs.value[commentId] = el as CommentComponentInstance;
  }
};

const refreshComments = async () => {
  if (commentStore.postId) {
    await commentStore.fetchComments(commentStore.postId);
  }
};

const startCommentRefresh = () => {
  if (commentRefreshInterval) {
    globalIntervalManager.removeInterval(commentRefreshInterval);
  }
  if (!commentStore.isPostingComment) {
    commentRefreshInterval = globalIntervalManager.addInterval(
      refreshComments,
      5000,
      'CommentsDialog',
    );
  }
};

const stopCommentRefresh = () => {
  if (commentRefreshInterval) {
    globalIntervalManager.removeInterval(commentRefreshInterval);
    commentRefreshInterval = null;
  }
};

// Watchers
watch(
  isOpen,
  (newValue) => {
    if (newValue) {
      startCommentRefresh();
    } else {
      stopCommentRefresh();
    }
  },
  { immediate: true },
);

watch(
  () => commentStore.isPostingComment,
  (isPosting) => {
    if (isPosting) {
      stopCommentRefresh();
    } else {
      if (isOpen.value) {
        startCommentRefresh();
      }
    }
  },
);

watch(
  () => commentStore.commentIsFetching,
  (isFetching, wasFetching) => {
    if (wasFetching && !isFetching && !hasInitiallyLoaded.value) {
      hasInitiallyLoaded.value = true;
    }
  },
);

// Unmount
onUnmounted(() => {
  stopCommentRefresh();
});

defineExpose({
  focusInput,
});
</script>

<style lang="postcss">
.comments-dialog-content {
  @media (max-width: 992px) {
    top: 0;
    transform: translateX(-50%);
    height: var(--vvh, 100dvh);
    min-width: 100dvw;
    border: none;
    border-radius: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }
}
</style>
