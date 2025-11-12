<template>
  <div class="doc">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';

defineProps<NodeProps>();
</script>

<style scoped>
.doc {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: white;
  color: black;
  width: 100%;
  height: 100%;
}
</style>
