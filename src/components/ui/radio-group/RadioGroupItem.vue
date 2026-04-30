<script setup lang="ts">
import type { RadioGroupItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/common';
import { Check } from 'lucide-vue-next';
import { RadioGroupIndicator, RadioGroupItem, useForwardProps } from 'reka-ui';
import { computed } from 'vue';

const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RadioGroupItem
    v-bind="forwardedProps"
    :class="
      cn(
        'focus-visible:ring-ring peer aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white',
        props.class,
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center rounded-full bg-primary">
      <Check class="h-3.5 w-3.5 stroke-white" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
