<template>
  <article class="column">
    <slot />
  </article>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';

defineProps<NodeProps>();
</script>

<style scoped>
.column {
  min-width: 0;
}
</style>
