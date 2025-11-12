<template>
  <p>
    <slot />
  </p>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed } from 'vue';
import { getParagraphAttrs } from '../extensions/Paragraph/ParagraphExtension';

const props = defineProps<NodeProps>();
const attrs = computed(() => getParagraphAttrs(props.node.attrs));
</script>

<style scoped>
p {
  margin: 0;
  text-align: v-bind('attrs.textAlign');
}
</style>
