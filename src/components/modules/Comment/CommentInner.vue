<template>
  <div class="relative" :class="{ 'flex items-center justify-center': isDeleted }">
    <div v-if="isDeleted" class="absolute flex w-full flex-col items-center justify-center gap-y-1">
      <span class="flex font-Matter text-xl leading-none dark:text-white">
        {{ t('comments.deletedComment') }}
      </span>
      <span class="flex font-Matter-Medium text-xs text-white/60">
        {{ t('comments.deletedCommentSubtitle') }}
      </span>
    </div>
    <div
      ref="commentWrapper"
      :data-comment-id="comment.id"
      class="flex w-full flex-col gap-y-4 transition-all duration-300"
      :class="[
        isHighlighted && 'is-highlighted',
        isSelectedComment && 'is-selected',
        isDeleted && 'blur-md',
      ]"
    >
      <div class="group grid grid-cols-12 items-center gap-x-4">
        <div
          class="col-span-2 row-span-3 row-end-2 flex h-max flex-col items-center justify-center gap-y-3"
        >
          <Avatar size="sm" class="overflow-hidden rounded-full">
            <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="t('comments.avatarAlt')" />
            <div
              v-else
              class="absolute flex h-10 w-10 items-center justify-center rounded-full bg-[#D9D9D9]"
            >
              <User class="h-7 w-7 stroke-white" />
            </div>
          </Avatar>
        </div>
        <span class="col-span-10 mb-1 font-Matter-Bold text-xs dark:text-white">
          {{ isDeleted ? t('comments.user') : comment.name }}
        </span>
        <div
          class="comment-content col-span-10 col-start-3 font-Matter text-sm dark:text-white"
          v-html="
            isDeleted || !comment.comment ? t('comments.commentHasBeenDeleted') : comment.comment
          "
        ></div>
        <div
          class="col-span-12 mt-3 flex w-full flex-wrap justify-end gap-x-3 gap-y-3 xs:col-span-10 xs:col-start-3 xs:justify-end sm:gap-y-0"
          :class="{ 'pointer-events-none': isDeleted }"
        >
          <div class="flex items-center gap-x-3 border-r border-white/30 pr-3">
            <div
              class="flex cursor-pointer select-none items-center gap-x-1 opacity-70 transition hover:opacity-100"
              @click="likeComment"
            >
              <Heart class="size-5 stroke-white" :class="{ 'stroke-red-600': isLiked }" />
              <span class="whitespace-nowrap font-Matter text-sm dark:text-white">{{ likes }}</span>
            </div>
            <div
              class="flex cursor-pointer select-none items-center gap-x-1 opacity-70 transition hover:opacity-100"
            >
              <Loader2 v-if="isRepliesFetching" class="size-4 animate-spin stroke-white" />
              <X
                v-else-if="isReplyFormOpen && !isRepliedComment"
                class="size-4 stroke-white"
                @click="handleReplyClick"
              />
              <Reply v-else class="size-5 stroke-white" @click="handleReplyClick" />
              <span
                class="whitespace-nowrap text-sm dark:text-white"
                @click="setCommentAction('reply')"
              >
                <span
                  v-if="!isRepliedComment"
                  class="whitespace-nowrap font-Matter text-sm dark:text-white"
                >
                  {{ replyCount || comment.replyCount }}
                </span>
              </span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-3 transition sm:gap-y-0">
            <div
              v-if="canEdit || isAdmin"
              class="flex cursor-pointer select-none items-center gap-x-1 opacity-70 transition hover:opacity-100"
              @click="setCommentAction('edit')"
            >
              <Pencil class="size-4 stroke-white" />
            </div>
            <div
              v-if="canEdit || isAdmin"
              class="flex cursor-pointer select-none items-center gap-x-1 opacity-70 transition hover:opacity-100"
              @click="setCommentAction('delete')"
            >
              <Trash class="size-4 stroke-white" />
            </div>
            <div
              class="flex cursor-pointer select-none items-center gap-x-1 opacity-70 transition hover:opacity-100"
              @click="setCommentAction('report')"
            >
              <TriangleAlert class="size-4 stroke-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { storeToRefs } from 'pinia';
import { useFanStore } from '@stores/fan.store';
import { useCommentStore } from '@stores/comment.store';

// Interfaces
import type { Comment } from '@api/comment.api';
interface CommentAction {
  id: string;
  name: string;
  comment: string;
  action: 'report' | 'delete' | 'edit' | 'reply';
  replyToId?: string;
}

// Components
import Avatar from '@ui/avatar/Avatar.vue';
import AvatarImage from '@ui/avatar/AvatarImage.vue';

// Icons
import { Loader2, TriangleAlert, Pencil, Trash, X, Reply, Heart, User } from 'lucide-vue-next';

// Props
const props = defineProps<{
  comment: Comment;
  isRepliesFetching?: boolean;
  isReplyFormOpen?: boolean;
  replyCount?: number;
}>();

// Composables
const { t } = useTranslation();
const fanStore = useFanStore();
const { isAdmin } = storeToRefs(fanStore);

// Stores
const commentStore = useCommentStore();

// Emits
const emit = defineEmits(['setReplyForm', 'closeReplies']);

// Refs
const likes = ref(props.comment.likeCount);
const isLiked = ref(props.comment.likedByMe);
const commentWrapper = ref<HTMLElement | null>(null);
const isHighlighted = ref(false);

// Computeds
const canEdit = computed(() => {
  return props.comment.fanId === fanStore.fanId;
});

const isRepliedComment = computed(() => {
  return props.comment.replyToId;
});

const isSelectedComment = computed(() => {
  const selectedData = commentStore.selectedCommentData;
  return selectedData && selectedData.id === props.comment.id;
});

const isDeleted = computed(() => {
  return !props.comment.comment;
});

const avatarUrl = computed(() => {
  return props.comment.avatarUrl && !isDeleted.value ? props.comment.avatarUrl : '';
});

const highlightComment = () => {
  isHighlighted.value = true;

  setTimeout(() => {
    isHighlighted.value = false;
  }, 2000);
};

// Watchers
watch(
  () => commentStore.selectedCommentData,
  (newSelectedData) => {
    if (newSelectedData && newSelectedData.id === props.comment.id) {
      highlightComment();

      if (commentWrapper.value) {
        const isReplyAction = newSelectedData.action === 'reply' && !isRepliedComment.value;
        commentWrapper.value.scrollIntoView({
          behavior: 'smooth',
          block: isReplyAction ? 'start' : 'center',
        });
      }
    }
  },
);

// Methods
const likeComment = async () => {
  const newLikedState = !isLiked.value;
  isLiked.value = newLikedState;
  likes.value = (likes.value || 0) + (newLikedState ? 1 : -1);

  await (newLikedState
    ? commentStore.likeComment(props.comment.id)
    : commentStore.deleteLikeComment(props.comment.id));
};

const handleReplyClick = () => {
  if (props.isReplyFormOpen && !isRepliedComment.value) {
    emit('closeReplies');
  } else {
    setCommentAction('reply');
  }
};

const setCommentAction = (action: CommentAction['action']) => {
  const baseData: CommentAction = {
    id: props.comment.id as string,
    name: props.comment.name as string,
    comment: props.comment.comment as string,
    action: action,
  };

  if (action !== 'report') {
    baseData.replyToId = props.comment.replyToId as string;
  }

  commentStore.setSelectedCommentData(
    baseData.id,
    baseData.name,
    baseData.comment,
    baseData.action,
    baseData.replyToId,
  );

  if (action === 'reply') {
    emit('setReplyForm');
  }
};

defineExpose({
  highlightComment,
});
</script>

<style scoped lang="postcss">
.is-highlighted {
  @apply relative;
  @keyframes flash {
    from {
      @apply bg-blue/10;
    }
    to {
      @apply bg-transparent;
    }
  }
  &::before {
    content: '';
    animation: flash 2s ease-in-out forwards;
    @apply absolute -left-5 -top-4 -z-10 h-[calc(100%+1rem)] w-[calc(100%+3rem)];
  }
}

.is-selected {
  @apply relative;
  @keyframes selectedPulse {
    0% {
      @apply bg-white/0;
    }
    50% {
      @apply bg-white/5;
    }
    100% {
      @apply bg-white/0;
    }
  }
  &::before {
    content: '';
    animation: selectedPulse 2s ease-in-out infinite;
    @apply absolute -left-6 -top-4 -z-10 h-[calc(100%+2rem)] w-[calc(100%+3rem)];
  }
}

.replied-comments-wrapper {
  .is-selected {
    &::before {
      @apply -left-14 w-[calc(100%+6rem)];
    }
  }
}

.transition-all {
  transition: all 0.3s ease-in-out;
}
</style>
