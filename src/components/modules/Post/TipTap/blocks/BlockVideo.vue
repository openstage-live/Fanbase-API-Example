<template>
  <div class="group relative w-full cursor-pointer" :style="{ aspectRatio: attrs.aspectRatio }">
    <MuxPlayerGeneric
      ref="muxPlayer"
      :content-id="attrs.contentId"
      :aspect-ratio="String(attrs.aspectRatio)"
      :show-controls="attrs.controls"
      :show-play-overlay="true"
      :env-key="muxEnvKey"
      class="video"
      @error="handleVideoError"
      @play="handlePlay"
      @ended="handleEnded"
    />
  </div>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed, ref } from 'vue';
import { getVideoAttrs } from '../extensions/Video/VideoExtension';

import MuxPlayerGeneric from '@modules/VideoPlayer/MuxPlayerGeneric.vue';
import { env } from '@/env';

const props = defineProps<NodeProps>();

// Refs
const muxPlayer = ref<InstanceType<typeof MuxPlayerGeneric> | null>(null);
const muxEnvKey = env.VITE_MUX_ENV_KEY;

// Computed
const attrs = computed(() => getVideoAttrs(props.node.attrs));

// Methods
const handlePlay = () => {
  props.addTelemetry?.('view-post-video');
};

const handleEnded = () => {
  props.addTelemetry?.('view-post-video-complete');
};

const handleVideoError = (message: string) => {
  console.error('TipTap BlockVideo error:', message);
};
</script>

<style scoped>
.video {
  --media-object-fit: cover;
  --media-object-position: center;
  width: 100%;
  height: 100%;
}
</style>
