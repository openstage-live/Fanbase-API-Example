<template>
  <div
    v-if="attrs.images.length > 0"
    v-bind="$attrs"
    class="grid"
    :style="{
      gridTemplateColumns: `repeat(${attrs.columns}, 1fr)`,
      gap: `${attrs.gap}px`,
    }"
  >
    <RichImage
      v-for="(image, index) in attrs.images"
      :key="image.src"
      :image
      :show-caption="attrs.captions"
      :aspect-ratio="attrs.aspectRatio"
      class="cursor-pointer"
      @click="lightbox?.openLightbox(index)"
    />
  </div>

  <ImageLightbox ref="lightbox" :images="attrs.images" />
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed, useTemplateRef } from 'vue';
import { getGalleryAttrs } from '../extensions/Gallery/GalleryExtension';
import ImageLightbox from './ImageLightbox.vue';
import RichImage from './RichImage.vue';

const props = defineProps<NodeProps>();
const attrs = computed(() => getGalleryAttrs(props.node.attrs));

const lightbox = useTemplateRef<InstanceType<typeof ImageLightbox>>('lightbox');
</script>
