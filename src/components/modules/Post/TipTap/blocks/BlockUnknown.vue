<template>
  <div class="unknown-block">
    <!-- Fallback for unknown node types -->
  </div>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';

defineProps<NodeProps>();
</script>

<style scoped>
.unknown-block {
  display: none;
}
</style>
