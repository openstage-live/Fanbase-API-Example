<template>
  <div
    class="group relative w-full cursor-pointer rounded-lg"
    :style="{ aspectRatio: attrs.aspectRatio }"
  >
    <!-- Thumbnail overlay (shown when not playing) -->
    <div
      v-if="!isPlaying && videoId"
      class="group absolute inset-0 z-10 overflow-hidden rounded-lg bg-cover bg-center bg-blend-multiply"
      @click="playVideo"
      :style="{ backgroundImage: `url(${thumbnailUrl})` }"
    >
      <div
        class="flex h-full w-full items-center justify-center bg-gradient-to-b from-black/40 to-black/10"
      >
        <CirclePlay
          class="relative z-10 h-16 w-16 stroke-white stroke-1 transition-transform group-hover:scale-110"
        />
      </div>
    </div>
    <!-- YouTube iframe -->
    <iframe
      v-show="iframeSrc"
      :src="iframeSrc as string"
      :title="attrs.title"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      class="h-full w-full rounded-lg border-none"
    />
  </div>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed, ref } from 'vue';
import { getYouTubeAttrs, getYouTubeEmbedUrl } from '../extensions/YouTube/YouTubeExtension';

// Components
import { CirclePlay } from 'lucide-vue-next';

// Props
const props = defineProps<NodeProps>();

// Refs
const isPlaying = ref(false);

// Computed
const attrs = computed(() => getYouTubeAttrs(props.node.attrs));
const videoId = computed(() => attrs.value.videoId);

const thumbnailUrl = computed(() => {
  if (!videoId.value) return '';
  return `https://img.youtube.com/vi/${videoId.value}/maxresdefault.jpg`;
});

const iframeSrc = computed(() => {
  if (!attrs.value.videoId) return null;

  if (isPlaying.value) {
    return `https://www.youtube.com/embed/${attrs.value.videoId}?autoplay=1`;
  }

  return getYouTubeEmbedUrl(attrs.value);
});

const playVideo = () => {
  isPlaying.value = true;
};
</script>
