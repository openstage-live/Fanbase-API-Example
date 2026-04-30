<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/common';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div :class="cn('text-sm dark:text-white [&_p]:leading-relaxed', props.class)">
    <slot />
  </div>
</template>
