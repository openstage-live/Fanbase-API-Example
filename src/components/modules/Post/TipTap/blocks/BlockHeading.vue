<template>
  <component :is="tag">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed } from 'vue';
import { getHeadingAttrs } from '../extensions/Heading/HeadingExtension';

const props = defineProps<NodeProps>();
const attrs = computed(() => getHeadingAttrs(props.node.attrs));
const level = computed(() => attrs.value.level);
const tag = computed(() => `h${level.value}`);
</script>

<style scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  text-align: v-bind('attrs.textAlign');
}
</style>
