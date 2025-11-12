<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/common';

interface SkeletonProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SkeletonProps>();
</script>

<template>
  <div :class="cn('animate-pulse rounded-xl bg-white/10', props.class)" />
</template>
