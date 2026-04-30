<template>
  <blockquote class="overflow-hidden">
    <slot />
  </blockquote>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';

defineProps<NodeProps>();
</script>
