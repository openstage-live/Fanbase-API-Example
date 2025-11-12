<script setup lang="ts">
import { cn } from '@/utils/common';
import { DialogTitle, type DialogTitleProps, useForwardProps } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DialogTitle
    v-bind="forwardedProps"
    :class="
      cn('text-base font-semibold leading-tight tracking-normal dark:text-white', props.class)
    "
  >
    <slot />
  </DialogTitle>
</template>
