<template>
  <div class="flex w-full flex-col items-center gap-y-3">
    <div class="comment-form-wrapper flex w-full flex-col gap-y-2">
      <Textarea
        ref="inputRef"
        v-model="comment"
        clearable
        :placeholder="placeholder || t('common.addAComment')"
        class="w-full dark:border-gray-600 dark:bg-black dark:text-white"
        :class="isReply && '!pt-9'"
        :disabled="isSending"
        @keydown.enter.prevent="handleSubmit()"
      />
      <InfoBar v-if="error" variant="destructive" :title="error" />
    </div>
    <div class="flex w-full flex-col justify-between gap-y-3">
      <Button :disabled="isSending || !comment" type="submit" @click="handleSubmit()">
        <Loader2 v-if="isSending" class="h-4 w-4 animate-spin" />
        {{ buttonLabel || replyToId ? t('common.confirm') : t('common.send') }}
      </Button>
      <Button
        v-if="replyToId || isEdit"
        size="sm"
        variant="link"
        type="button"
        @click="resetForm()"
      >
        {{ t('common.cancel') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useTranslation } from '@/locales/i18n';
import type { ComponentPublicInstance } from 'vue';

// Stores
import { useCommentStore } from '@stores/comment.store';

// Types
type InputRefType = ComponentPublicInstance & {
  focus?: () => void;
  textareaRef?: { value: HTMLTextAreaElement | null };
};

type CommentComponentInstance = ComponentPublicInstance & {
  fetchReplies?: () => Promise<void>;
  highlightComment?: () => void;
};

const commentStore = useCommentStore();

// Components
import Button from '@ui/button/Button.vue';
import { Textarea } from '@ui/textarea';
import InfoBar from '@generics/InfoBar.vue';

// Icons
import { Loader2 } from 'lucide-vue-next';

// Refs
const inputRef = ref<InputRefType | null>(null);
const isSending = ref(false);
const comment = ref('');

// Props
const props = defineProps<{
  placeholder?: string;
  buttonLabel?: string;
  error?: string;
  commentRefs?: Record<string, CommentComponentInstance | null>;
}>();

// Composables
const { t } = useTranslation();

// Computed
const replyToId = computed(() => {
  return commentStore.selectedCommentData?.parentId;
});

const isEdit = computed(() => {
  return commentStore.selectedCommentData?.action === 'edit';
});

const isReply = computed(() => {
  return commentStore.selectedCommentData?.action === 'reply';
});

const isRepliedComment = computed(() => {
  return (
    commentStore.selectedCommentData?.action === 'reply' &&
    commentStore.selectedCommentData?.parentId !== commentStore.selectedCommentData.id
  );
});

// Methods
const focus = () => {
  inputRef.value?.focus?.();
};

const handleEdit = async (commentId: string, text: string, postId: string) => {
  await commentStore.patchComment(commentId, text);
  await commentStore.fetchComments(postId);

  if (replyToId.value) {
    await refreshComments(postId, replyToId.value);
  } else {
    await commentStore.fetchComments(postId);
  }

  commentStore.clearSelectedCommentData();
};

const refreshComments = async (postId: string, replyId: string) => {
  await commentStore.fetchReplies(postId, replyId);

  if (props.commentRefs && replyId) {
    const parentComment = props.commentRefs[replyId];
    if (parentComment?.fetchReplies) {
      await parentComment.fetchReplies();
    }
  }
};

const handleCreate = async (postId: string, text: string, replyId?: string) => {
  const commentText = isRepliedComment.value
    ? `<span class="font-Matter-Bold dark:text-white" data-name>${commentStore.selectedCommentData?.name} </span><span>${text}</span>`
    : text;

  await commentStore.postComment(postId, commentText, replyId);

  if (replyId) {
    await refreshComments(postId, replyId);
  } else {
    await commentStore.fetchComments(postId);
  }
};

const resetForm = () => {
  isSending.value = false;
  commentStore.clearSelectedCommentData();
  comment.value = '';
};

const scrollToComment = (initialRefs: string[], parentId?: string) => {
  if (parentId && props.commentRefs?.[parentId]) {
    props.commentRefs[parentId].$el?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
    return;
  }

  const newComment = Object.keys(props.commentRefs || {}).find((ref) => !initialRefs.includes(ref));

  if (newComment && props.commentRefs?.[newComment]) {
    props.commentRefs[newComment].$el?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
    props.commentRefs[newComment].highlightComment?.();
  }
};

const handleSubmit = async () => {
  isSending.value = true;

  const initialRefs = Object.keys(props.commentRefs || {});
  const postId = commentStore.postId;
  const replyId = replyToId.value;
  const text = comment.value;

  try {
    if (!postId) return;

    if (isEdit.value) {
      const commentId = commentStore.selectedCommentData?.id;

      if (!commentId) return;
      await handleEdit(commentId, text, postId);
    } else {
      await handleCreate(postId, text, replyId);
    }

    if (replyId) {
      commentStore.clearSelectedCommentData();
    }

    scrollToComment(initialRefs, replyId);
  } catch (error) {
    console.error(error);
  } finally {
    resetForm();
  }
};

const stripHtml = (html: string): string => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const nameElement = tempDiv.querySelector('[data-name]');
  if (nameElement) {
    nameElement.remove();
    const remainingText = tempDiv.textContent?.trim() || '';
    return remainingText;
  }

  return tempDiv.textContent || tempDiv.innerText || '';
};

// Watchers
watch(
  () => commentStore.selectedCommentData,
  async (value) => {
    focus();
    if (value?.action === 'edit') {
      const commentText = commentStore.selectedCommentData?.comment as string;
      comment.value = stripHtml(commentText);
    } else {
      comment.value = '';
    }
  },
  { immediate: true },
);

defineExpose({
  focus,
});
</script>

<style scoped lang="postcss">
.comment-form-wrapper {
  :deep(textarea) {
    @apply rounded-2xl border-none bg-[#222222] p-4;
  }
}
</style>
