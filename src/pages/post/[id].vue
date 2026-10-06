<template>
  <div>
    <div v-if="isLoading" class="container flex min-h-[100dvh] items-center justify-center">
      <LoadingSection isInverted />
    </div>
    <div v-else-if="hasError" class="flex items-center justify-center">
      <ErrorMessage />
    </div>
    <template v-else>
      <div class="flex items-center justify-center">
        <div
          class="container flex-col justify-between border-b border-l border-r border-white/10 bg-cover bg-center px-0"
          :class="{ 'border-b-0 border-l-0 border-r-0': model?.thumbnailImage }"
          :style="{ backgroundImage: `url(${model?.thumbnailImage})` }"
        >
          <div
            class="h-full w-full bg-gradient-to-b from-black/100 to-black/0 px-4 pb-4 pt-20 lg:pb-20 lg:pt-32"
          >
            <h2 v-if="model" class="uppercase text-white/50">
              {{ displayDateTime }}
            </h2>
            <h1
              class="font-Matter-Medium text-4xl uppercase leading-none text-white sm:text-5xl lg:text-7xl"
            >
              {{ model?.title || t('common.loading') }}
            </h1>
          </div>
        </div>
      </div>
      <div class="container border-l border-r border-white/10 px-0" v-if="model">
        <div class="post-tip-tap flex flex-col gap-4 border-b border-white/10 px-4">
          <BlockGate v-if="model.accessGranted === false" class="my-8" />
          <template v-else>
            <PostRenderer
              v-for="(post, i) in model?.content?.content"
              :key="`content-${i}`"
              :node="post"
              :addTelemetry
              class="relative"
            />
          </template>
        </div>
        <div class="mx-auto flex w-full justify-center py-12">
          <PostActions :post="model" :date="displayDateTime" />
        </div>
      </div>
      <div
        v-if="filteredPostList.length > 0"
        class="container border-l border-r border-t border-white/10 px-0"
      >
        <h2 class="p-4 font-Matter-Medium text-3xl uppercase text-white lg:p-8 lg:text-4xl">
          {{ t('common.relatedPosts') }}
        </h2>
        <Swiper
          :modules="modules"
          :pagination="{ clickable: true }"
          :navigation="true"
          :slides-per-view="1"
          :space-between="0"
        >
          <SwiperSlide v-for="post in filteredPostList" :key="post.id">
            <PostFeedItem :post="post" />
          </SwiperSlide>
        </Swiper>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { isAfter, format } from 'date-fns';
import { useTranslation } from '@/locales/i18n';
import { useArtistStore } from '@stores/artist.store';
import { useBandsInTownStore } from '@/stores/bandsInTown.store';
import { usePostStore } from '@stores/post.store';
import { postTelemetry } from '@api/tracking.api';
import type { PostItem } from '@api/post.api';

import LoadingSection from '@generics/LoadingSection.vue';
import BlockGate from '@modules/Post/TipTap/blocks/BlockGate.vue';
import PostRenderer from '@modules/Post/PostRenderer.vue';
import PostActions from '@modules/Post/PostActions.vue';
import PostFeedItem from '@modules/PostFeed/PostFeedItem.vue';
import ErrorMessage from '@generics/ErrorMessage.vue';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

definePage({
  name: 'Post',
  meta: {
    public: true,
    bgColor: 'black',
  },
});

const { t } = useTranslation();
const route = useRoute();
const postStore = usePostStore();
const artistStore = useArtistStore();
const bandsInTownStore = useBandsInTownStore();
const modules = [Navigation, Autoplay, Pagination];
const {
  postList,
  post: model,
  isPostFetching: isLoading,
  postError: hasError,
} = storeToRefs(postStore);

const filteredPostList = computed(() => {
  if (!model.value?.postCollectionId || !postList.value) {
    return [];
  }

  return postList.value.filter(
    (post: PostItem) =>
      post.postCollectionId === model.value?.postCollectionId && post.id !== model.value?.id,
  );
});

const displayDateTime = computed(() => {
  if (!model.value) return '';

  const { startAt, createdAt } = model.value;
  return format(startAt && isAfter(startAt, createdAt) ? startAt : createdAt, 'd MMMM');
});

const addTelemetry = (metric: string) => {
  if (!model.value?.title || !model.value?.id) return;

  postTelemetry({
    metric,
    resource: model.value.title,
    resourceId: model.value.id,
  });
};

onMounted(async () => {
  const id = 'id' in route.params ? route.params.id : '';
  await postStore.fetchPost(id);
  await postStore.fetchPostList();

  if (artistStore.bandsInTownArtistId) {
    await Promise.all([bandsInTownStore.refreshEvents(), bandsInTownStore.refreshArtist()]);
  }

  addTelemetry('post-view');
});
</script>
