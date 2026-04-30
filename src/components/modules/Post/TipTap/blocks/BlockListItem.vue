<template>
  <li>
    <slot />
  </li>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';

defineProps<NodeProps>();
</script>
