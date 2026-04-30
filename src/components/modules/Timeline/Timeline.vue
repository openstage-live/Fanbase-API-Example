<template>
  <div class="mt-8">
    <TimelineSkeleton v-if="isFetching" />
    <template v-else>
      <div class="mb-12 grid gap-y-4">
        <div
          class="mb-4 flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <h3 class="title-md text-white">{{ t('common.timeline') }}</h3>
        </div>

        <div class="grid gap-y-4">
          <div class="flex flex-col gap-x-2">
            <div class="flex items-center py-4 pl-4">
              <ListFilter color="white" class="mr-4 h-8 w-8 stroke-white" />
              <Swiper
                :modules="[FreeMode]"
                :freeMode="true"
                :slides-per-view="'auto'"
                :space-between="10"
                class="w-full"
              >
                <SwiperSlide
                  v-for="filter in Object.values(TIMELINE_ITEM_TYPES)"
                  :key="filter"
                  class="!w-fit"
                >
                  <TimelineBadge
                    :type="filter"
                    :isActive="isFilterActive(filter)"
                    isClickable
                    @click="toggleFilter(filter)"
                  />
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      <template v-if="displayedItems.length > 0">
        <div v-for="yearGroup in itemsGroupedByYear" :key="yearGroup.year" class="mb-16">
          <div v-for="group in yearGroup.months" :key="group.period" class="relative">
            <div class="mb-8 flex gap-x-5 border-t border-t-white/60 pt-8">
              <h4 class="font-Matter-Medium text-5xl uppercase text-white">
                {{ formatPeriod(group.period) }}
              </h4>
            </div>
            <TimelineItem v-for="item in group.items" :key="item.id" :item="item" />
          </div>
          <div class="relative z-10 mb-8 flex gap-x-5 border-t border-t-white/60 pt-8">
            <h3 class="font-Matter-Medium text-6xl uppercase text-white">
              {{ yearGroup.year }}
            </h3>
          </div>
        </div>

        <div v-if="hasMoreItems" ref="loadMoreTrigger" class="h-1"></div>
      </template>

      <template v-else>
        <div class="mx-auto flex flex-col items-center pb-20 pt-4 lg:max-w-md">
          <span class="mb-6 block w-full text-center font-Matter text-4xl text-white lg:mb-12">{{
            t('profile.emptyTimeline')
          }}</span>
          <TimelineBadge
            class="mb-6"
            :type="(activeFilterType as TimelineItemType) || 'my-story'"
            is-active
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { TIMELINE_ITEM_TYPES, useTimelineStore } from '@/stores/timeline.store';
import { useTranslation } from '@/locales/i18n';
import { useIntersectionObserver } from '@vueuse/core';
import TimelineItem from './TimelineItem.vue';
import TimelineSkeleton from './TimelineSkeleton.vue';
import type { TimelineItemType } from '@/stores/timeline.store';
import 'swiper/css';

import { format, parseISO } from 'date-fns';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import TimelineBadge from './TimelineBadge.vue';
import { ListFilter } from 'lucide-vue-next';

const timelineStore = useTimelineStore();
const {
  isFetching,
  displayedItems,
  itemsGroupedByYear,
  isLoadingMore,
  hasMoreItems,
  activeFilter,
} = storeToRefs(timelineStore);
const { isFilterActive, toggleFilter, loadMoreItems } = timelineStore;
const { t } = useTranslation();

// Computed property that returns the active filter
const activeFilterType = computed(() => activeFilter.value);

// Intersection observer trigger element
const loadMoreTrigger = ref<HTMLElement>();

const formatPeriod = (date: string) => format(parseISO(date), 'MMMM');

// Set up intersection observer for auto-loading
useIntersectionObserver(
  loadMoreTrigger,
  ([entry]) => {
    if (entry?.isIntersecting && hasMoreItems.value && !isLoadingMore.value) {
      loadMoreItems();
    }
  },
  { threshold: 0.1 },
);

onMounted(() => {
  timelineStore.fetch();
});
</script>
