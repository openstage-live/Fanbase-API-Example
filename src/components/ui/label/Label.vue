<script setup lang="ts">
import { cn } from '@/utils/common';
import { Label, type LabelProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';
import { type LabelVariants, labelVariants } from '.';

const props = withDefaults(
  defineProps<
    LabelProps & { class?: HTMLAttributes['class']; variant?: LabelVariants['variant'] }
  >(),
  { variant: 'default' },
);

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <Label v-bind="delegatedProps" :class="cn(labelVariants({ variant }), props.class)">
    <slot />
  </Label>
</template>
