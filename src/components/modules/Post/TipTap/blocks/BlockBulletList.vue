<template>
  <ul class="bullet-list">
    <slot />
  </ul>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';

defineProps<NodeProps>();
</script>

<style scoped>
.bullet-list {
  padding-left: 1.5rem;
}
</style>
