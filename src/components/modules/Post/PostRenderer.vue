<template>
  <div class="post-renderer">
    <RenderNode :node :addTelemetry />
  </div>
</template>

<script setup lang="ts">
import RenderNode, { type NodeProps } from '@modules/Post/TipTap/blocks/RenderNode.vue';

defineProps<NodeProps>();
</script>

<style scoped>
.post-renderer {
  display: block;
  width: 100%;
  height: 100%;
}

:where(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
