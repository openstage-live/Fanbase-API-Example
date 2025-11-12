<template>
  <div>
    <PostFeedError v-if="postListError" />
    <Skeleton v-if="isPostCollectionListFetching" class="my-2 h-14 w-full" />
    <div v-else-if="postCollectionList.length > 0" class="flex items-center py-4 pl-4">
      <ListFilter class="mr-4 h-8 w-8 stroke-white" />
      <Swiper
        :modules="[FreeMode]"
        :freeMode="true"
        :slides-per-view="'auto'"
        :space-between="10"
        class="w-full"
      >
        <SwiperSlide v-for="filter in postCollectionList" :key="filter.id" class="!w-fit">
          <PostCollectionItem
            :collection="filter"
            :isActive="activeFilterId === filter.id"
            isClickable
            @click="filterPosts(filter.id)"
          />
        </SwiperSlide>
      </Swiper>
    </div>
    <Skeleton v-if="isPostListFetching" class="aspect-square" />
    <template v-else-if="displayedPosts.length > 0">
      <PostFeedItem v-for="post in displayedPosts" :key="post.id" :post="post" />
      <div v-if="hasMorePosts" ref="loadMoreTrigger" class="h-1" />
      <div v-if="!hasMorePosts" class="border-b border-t border-white/10 text-center">
        <p class="py-8 font-Matter text-xl text-white/50">
          {{ t('common.endOfFeed') }}
        </p>
      </div>
    </template>
    <template v-else>
      <div class="flex aspect-square items-center justify-center border-b border-t border-white/10">
        <p class="my-8 font-Matter text-2xl text-white">
          {{ t('common.noPostsFound') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTranslation } from '@/locales/i18n';
import { useInfiniteScroll } from '@composables/useInfiniteScroll';
import { usePostFiltering } from '@composables/usePostFiltering';
import { usePostStore } from '@stores/post.store';
import { usePostCollectionStore } from '@stores/postCollection.store';
import { storeToRefs } from 'pinia';

import { ListFilter } from 'lucide-vue-next';
import { Skeleton } from '@ui/skeleton';
import PostFeedError from '@modules/PostFeed/PostFeedError.vue';
import PostFeedItem from '@modules/PostFeed/PostFeedItem.vue';
import PostCollectionItem from '@modules/Post/PostCollectionItem.vue';

const postStore = usePostStore();
const { postList, isPostListFetching, postListError } = storeToRefs(postStore);
const postCollectionStore = usePostCollectionStore();
const { postCollectionList, isPostCollectionListFetching } = storeToRefs(postCollectionStore);

import { Swiper, SwiperSlide } from 'swiper/vue';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';

const { t } = useTranslation();
const route = useRoute();

// Post filtering logic
const {
  activeFilterId,
  filteredPosts,
  setFilter,
  applyFilterFromQuery: applyFilter,
} = usePostFiltering(
  () => postList.value,
  () => postCollectionList.value,
);

// Use infinite scroll composable
const {
  displayedItems: displayedPosts,
  hasMore: hasMorePosts,
  triggerElement: loadMoreTrigger,
  reset: resetPagination,
} = useInfiniteScroll(() => filteredPosts.value);

const filterPosts = (filterId: string) => {
  setFilter(filterId);
  resetPagination();
};

const applyFilterFromQuery = () => {
  const filterParam = route.query.filter as string;
  applyFilter(filterParam);
};

// Handle post list changes and query filter application
watch(
  postList,
  () => {
    if (postList.value?.length && route.query.filter) {
      applyFilterFromQuery();
    }
  },
  { immediate: true },
);

// Reset pagination when filtered posts change
watch(filteredPosts, resetPagination);

onMounted(() => {
  postCollectionStore.fetchPostCollectionList();
  postStore.fetchPostList();
});
</script>
