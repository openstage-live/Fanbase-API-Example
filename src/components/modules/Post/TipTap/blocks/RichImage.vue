<template>
  <figure class="relative flex select-none flex-col" :style="{ alignItems }">
    <img
      class="block w-full object-cover object-center"
      :src="image.src"
      :alt="image.alt"
      :title="image.title"
      :style="{ maxWidth, aspectRatio }"
    />
    <figcaption
      v-if="showCaption && image.caption"
      class="w-full p-2 text-white"
      :style="{ textAlign }"
    >
      {{ image.caption }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { ImageAlign } from '../extensions/Image/ImageExtension';
import { computed } from 'vue';

interface RichImage {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

const props = defineProps<{
  image: RichImage;
  width?: number | null;
  align?: ImageAlign;
  showCaption?: boolean;
  aspectRatio?: number | null;
}>();

const maxWidth = computed(() => (typeof props.width === 'number' ? props.width + 'px' : '100%'));

const alignItems = computed(() => {
  switch (props.align) {
    case 'left':
      return 'flex-start';
    case 'right':
      return 'flex-end';
    default:
      return 'center';
  }
});

const aspectRatio = computed(() => props.aspectRatio ?? 'auto');

const textAlign = computed(() => props.align ?? 'center');
</script>
