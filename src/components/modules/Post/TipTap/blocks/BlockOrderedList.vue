<template>
  <ol class="ordered-list">
    <slot />
  </ol>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';

defineProps<NodeProps>();
</script>

<style scoped>
.ordered-list {
  padding-left: 1.5rem;
}
</style>
