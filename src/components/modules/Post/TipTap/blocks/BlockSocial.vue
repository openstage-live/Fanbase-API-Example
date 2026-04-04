<template>
  <div class="social-wrapper" :style="{ gap: `12px ${attrs.gap}px` }">
    <a
      v-for="platform in enabledPlatforms"
      :key="platform.name"
      :href="platform.url"
      class="social-icon"
      :style="iconStyle"
      target="_blank"
      rel="noopener"
    >
      <InlineSvg :src="platform.iconUrl" :title="platform.name" :color />
    </a>
  </div>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed } from 'vue';
import { getEnabledSocialPlatforms, getSocialAttrs } from '../extensions/Social/SocialExtension';
import { storeToRefs } from 'pinia';
import { useArtistStore } from '@/stores/artist.store';
import InlineSvg from 'vue-inline-svg';

const props = defineProps<NodeProps>();

const artistStore = useArtistStore();
const { socialUrls } = storeToRefs(artistStore);

const attrs = computed(() => getSocialAttrs(props.node.attrs));

const defaultAccent = '#ffffff';

const color = computed(() => attrs.value.color ?? defaultAccent);

const enabledPlatforms = computed(() => {
  return getEnabledSocialPlatforms(attrs.value, socialUrls.value);
});

const iconStyle = computed(() => {
  return {
    backgroundColor: attrs.value.backgroundColor ?? 'transparent',
    borderRadius: `${attrs.value.borderRadius}px`,
  };
});
</script>

<style scoped>
.social-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.social-icon {
  padding: 6px;
  width: 42px;
  height: 42px;
  text-decoration: none;
}
</style>
