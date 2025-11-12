<template>
  <iframe
    v-if="src"
    :src
    :height
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    frameborder="0"
    loading="lazy"
    class="w-full rounded-[12px]"
  />
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { getSpotifyAttrs, getSpotifyEmbedUrl } from '../extensions/Spotify/SpotifyExtension';
import { computed } from 'vue';

// Props
const props = defineProps<NodeProps>();

// Computed
const attrs = computed(() => getSpotifyAttrs(props.node.attrs));
const src = computed(() => getSpotifyEmbedUrl(attrs.value));
const height = computed(() => (attrs.value.size === 'compact' ? '152' : '352'));
</script>
