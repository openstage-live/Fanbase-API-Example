<template>
  <VueEasyLightbox
    :visible="visible"
    :imgs="lightboxImages"
    :index="currentIndex"
    @hide="closeLightbox"
  />
</template>

<script setup lang="ts">
import type { RichImage } from '../extensions/shared/Image.schema';
import { computed, ref } from 'vue';
import VueEasyLightbox from 'vue-easy-lightbox';

const props = defineProps<{
  images: RichImage[];
}>();

const visible = ref(false);
const currentIndex = ref(0);

const lightboxImages = computed(() =>
  props.images.map((image) => ({
    src: image.src,
    title: image.caption || image.title || image.alt,
  })),
);

const openLightbox = (index: number) => {
  currentIndex.value = index;
  visible.value = true;
};

const closeLightbox = () => {
  visible.value = false;
};

defineExpose({
  openLightbox,
});
</script>
