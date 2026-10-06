<template>
  <RouterLink
    v-if="post.id"
    :to="{ name: 'Post', params: { id: post.id } }"
    class="group relative flex aspect-square h-full w-full border-b border-t border-white/10"
  >
    <img
      v-if="post.thumbnailImage"
      :src="post.thumbnailImage"
      :alt="post.title ?? ''"
      class="aspect-square object-cover"
    />
    <div v-else class="flex aspect-square items-center justify-center">
      <Image class="h-1/2 w-1/2 stroke-white stroke-[0.5]" />
    </div>
    <div
      class="absolute inset-0 left-0 top-0 bg-gradient-to-b from-black/50 via-black/0 via-25% to-black/50 to-100%"
    >
      <div class="flex h-full flex-col justify-between">
        <div class="flex items-center justify-between gap-x-2 p-4 lg:p-8">
          <div class="flex flex-col">
            <span class="flex font-Matter-Medium text-base uppercase text-white/60">
              {{ displayDateTime }}
            </span>
            <h3
              class="w-full font-Matter-Medium text-2xl uppercase text-white sm:text-3xl md:text-4xl"
            >
              {{ post.title }}
            </h3>
          </div>
          <Pin v-if="post.pinned" class="h-fit w-10 stroke-white" />
        </div>
        <div
          class="flex cursor-default items-center justify-between p-4 lg:p-8"
          @click="preventRouterNavigation"
        >
          <PostCollectionItem
            v-if="postCollection"
            :collection="postCollection"
            :isLoading="isPostCollectionListFetching"
          />
          <div class="ml-auto flex items-center gap-x-1">
            <PostActions :post="post" :date="displayDateTime" />
          </div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isAfter, format } from 'date-fns';
import { storeToRefs } from 'pinia';
import { usePostCollectionStore } from '@stores/postCollection.store';
import type { PostCollection } from '@api/postCollection.api';
import type { PostItem } from '@api/post.api';

import { Pin, Image } from 'lucide-vue-next';
import PostCollectionItem from '@modules/Post/PostCollectionItem.vue';
import PostActions from '@modules/Post/PostActions.vue';

const props = defineProps<{
  post: PostItem;
}>();

const postCollectionStore = usePostCollectionStore();
const { postCollectionList, isPostCollectionListFetching } = storeToRefs(postCollectionStore);

const displayDateTime = computed(() => {
  const { startAt, createdAt } = props.post;
  return format(startAt && isAfter(startAt, createdAt) ? startAt : createdAt, 'd MMMM');
});

const postCollection = computed(() => {
  return postCollectionList.value?.find(
    (collection: PostCollection) => collection.id === props.post.postCollectionId,
  );
});

const preventRouterNavigation = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};
</script>
