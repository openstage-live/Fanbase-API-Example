<template>
  <mux-player
    v-if="playbackData"
    :playback-id="playbackData.playbackId"
    :playback-token="playbackData.token"
    :thumbnail-token="playbackData.thumbnailToken"
    :prefer-playback="isSafari ? 'native' : 'mse'"
    audio
    @error="handleAudioError"
    @abort="handleSafariEvent"
    @stalled="handleSafariEvent"
    @play="handleAudioPlay"
    @ended="handleAudioEnded"
    class="py-4 pr-8"
  />
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import '@mux/mux-player';
import { computed } from 'vue';
import { getAudioAttrs } from '../extensions/Audio/AudioExtension';
import { ref, onMounted } from 'vue';
import SafariVideoFix from '@/utils/safariVideoFix';

// Interfaces
import { getPostPlay, type PlaybackData } from '@api/post.api';

// Refs
const playbackData = ref<PlaybackData | null>(null);
const isSafari = ref(SafariVideoFix.isSafari());

// Props
const props = defineProps<NodeProps>();

// Computed
const attrs = computed(() => getAudioAttrs(props.node.attrs));

// Error handling methods
const handleSafariEvent = (event: Event) => {
  const eventType = event.type;
  const target = event.target as HTMLAudioElement & {
    readyState: number;
    paused: boolean;
  };

  // Log Safari events for debugging but don't treat as errors
  console.log(`🦊 BlockAudio Safari ${eventType} event:`, {
    readyState: target?.readyState,
    paused: target?.paused,
    timestamp: Date.now(),
  });

  // Safari frequently fires stalled/abort events that aren't actual errors
  if (eventType === 'stalled') {
    console.log(
      '🦊 BlockAudio Safari stalled event - this is normal Safari behavior, not an error',
    );
    return;
  }

  if (eventType === 'abort') {
    console.log('🦊 BlockAudio Safari abort event - this is normal Safari behavior, not an error');
    return;
  }
};

const handleAudioError = (event: Event) => {
  const target = event.target as HTMLAudioElement & {
    error?: { code: number; message: string };
  };
  const errorType = event.type;
  const errorCode = target?.error?.code;
  const errorMessage = target?.error?.message;

  console.error('BlockAudio error:', { errorType, errorCode, errorMessage });

  // Only log actual errors, Safari stalled/abort events are handled separately
  if (errorType === 'error' && target?.error) {
    console.error('BlockAudio playback error:', target.error);
  }
};

const handleAudioPlay = () => {
  props.addTelemetry?.('play-post-audio');
};

const handleAudioEnded = () => {
  props.addTelemetry?.('play-post-audio-complete');
};

// Lifecycle hooks
onMounted(async () => {
  const result = await getPostPlay({ id: attrs.value.contentId, thumbnailTime: 0 });

  if (result.success) {
    playbackData.value = result.data;
  }
});
</script>

<style scoped lang="postcss">
mux-player {
  --media-primary-color: hsla(var(--white));
  --media-accent-color: hsla(var(--white), 0.8);

  &::part(bottom) {
    --media-time-range-buffered-color: hsla(var(--white), 0.25);
  }
  &:host {
    --media-control-hover-background: hsla(var(--white), 0.25);
  }
}
</style>
