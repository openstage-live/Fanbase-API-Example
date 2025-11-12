<template>
  <div class="group border-b border-t border-white/20 last-of-type:border-b-transparent">
    <component
      :is="item.link ? 'a' : 'div'"
      :href="item.link?.url"
      :target="item.link?.isExternal ? '_blank' : undefined"
      :rel="item.link?.isExternal ? 'noopener noreferrer' : undefined"
      class="flex w-full items-start gap-x-6 py-8 lg:px-3"
      :class="item.link ? 'cursor-pointer transition-colors hover:bg-white/5' : ''"
    >
      <div class="mt-1">
        <TimelineBadge :type="item.type" variant="icon" />
      </div>
      <div class="flex w-full flex-col gap-5 overflow-hidden md:flex-row md:items-start">
        <img
          v-if="item.image"
          :src="item.image.url"
          :alt="item.image.alt"
          class="h-[100px] w-[100px] flex-shrink-0 rounded-[20px] object-cover"
        />
        <div class="group flex flex-col gap-y-2">
          <div class="flex flex-col gap-y-1">
            <h5 class="text-xs uppercase text-white opacity-40">
              {{ formatDate(item.date) }}
            </h5>
            <h3
              v-if="item.title"
              class="font-Matter-Medium text-lg uppercase text-white"
              :class="item.description ? 'text-lg' : 'text-xs'"
            >
              {{ item.title }}
            </h3>
            <h4 v-if="item.description" class="text-sm text-white">
              {{ item.description }}
            </h4>
            <div v-if="item.link && item.link.label" class="mt-2 flex items-center gap-x-2">
              <span v-if="item.link.label" class="text-xs text-white/60">{{
                item.link.label
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import type { TimelineItem } from '@/stores/timeline.store';
import { format, parseISO } from 'date-fns';
import TimelineBadge from './TimelineBadge.vue';

defineProps<{
  item: TimelineItem;
}>();

const formatDate = (date: string) => format(parseISO(date), 'EEE do MMM');
</script>
