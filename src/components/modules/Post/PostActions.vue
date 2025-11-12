<template>
  <Button
    v-if="isAuthenticated"
    variant="outlineInverse"
    class="rounded-lg px-2 opacity-80 transition hover:opacity-100"
    @click="likeContent"
  >
    <Heart class="!h-6 !w-6" :class="isLiked ? 'stroke-red-500' : 'stroke-white'" />
    <span class="font-Matter text-lg text-white">{{ likes }}</span>
  </Button>
  <Button
    v-if="isAuthenticated && !post.hideComments"
    variant="outlineInverse"
    class="rounded-lg px-2 opacity-80 transition hover:opacity-100"
    @click="fetchComments"
  >
    <MessageCircle class="!h-6 !w-6 stroke-white" />
    <span class="font-Matter text-lg text-white">
      {{ hasValidComments ? post.commentCount : 0 }}
    </span>
  </Button>
  <ShareButton
    :title="post.title as string"
    :text="post.description"
    :media="post.thumbnailImage"
    :url="postUrl || ''"
    :post-id="post.id"
    isWhite
    @click="preventRouterNavigation"
  />
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { usePostStore } from '@stores/post.store';
import { useCommentStore } from '@stores/comment.store';
import { useAccountStore } from '@stores/account.store';
import { storeToRefs } from 'pinia';
import type { PostItem } from '@api/post.api';
import { openCommentsDialogKey } from '@/utils/symbols';

import ShareButton from '@generics/Buttons/ShareButton.vue';
import Button from '@ui/button/Button.vue';
import { Heart, MessageCircle } from 'lucide-vue-next';
import { env } from '@/env';

const props = defineProps<{
  post: PostItem;
  date: string;
}>();

const postStore = usePostStore();
const commentStore = useCommentStore();
const accountStore = useAccountStore();
const { isAuthenticated } = storeToRefs(accountStore);

const openCommentsDialog = inject(openCommentsDialogKey);

const likes = ref(props.post.likeCount || 0);
const isLiked = ref(props.post.likedByMe || false);

const postUrl = computed(() => `${env.VITE_HOME_URL}/post/${props.post.id}`);
const hasValidComments = computed(() => (props.post.commentCount || 0) > 0);

const likeContent = async () => {
  if (!isLiked.value) {
    isLiked.value = true;
    likes.value = (likes.value || 0) + 1;

    await postStore.likePost(props.post.id as string);
  } else {
    isLiked.value = false;
    likes.value = (likes.value || 0) - 1;

    await postStore.deleteLikePost(props.post.id as string);
  }
};

const fetchComments = async () => {
  if (openCommentsDialog) {
    await openCommentsDialog(
      props.post.id as string,
      props.post.title as string,
      props.date as string,
    );
  } else {
    await commentStore.openCommentDialog(
      true,
      props.post.id as string,
      props.post.title as string,
      props.date as string,
    );
  }
};

const preventRouterNavigation = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};
</script>
