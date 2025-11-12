<template>
  <figure
    class="relative h-full w-full select-none"
    :style="{ aspectRatio: aspectRatio ?? 'auto' }"
  >
    <img
      class="block h-full w-full object-cover object-center"
      :src="image.src"
      :alt="image.alt"
      :title="image.title"
    />
    <figcaption
      v-if="showCaption && image.caption"
      class="fill-available absolute bottom-0 h-max bg-black/30 py-2 text-center text-sm text-white"
    >
      {{ image.caption }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
interface RichImage {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

defineProps<{
  image: RichImage;
  showCaption?: boolean;
  aspectRatio?: number | null;
}>();
</script>

<style scoped>
.fill-available {
  width: -webkit-fill-available;
}
</style>
