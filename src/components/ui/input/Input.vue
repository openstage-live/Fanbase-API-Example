<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/common';
import { useVModel } from '@vueuse/core';
import { type InputVariants, inputVariants } from '.';

const props = withDefaults(
  defineProps<{
    defaultValue?: string | number;
    modelValue?: string | number;
    hasFloatLabel?: boolean;
    class?: HTMLAttributes['class'];
    error?: string;
    readonly?: boolean;
    disabled?: boolean;
    variant?: InputVariants['variant'];
  }>(),
  {
    hasFloatLabel: true,
    readonly: false,
    disabled: false,
    variant: 'default',
  },
);

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <input
    v-model="modelValue"
    :disabled="disabled || readonly"
    :readonly="readonly"
    :class="
      cn(
        inputVariants({ variant }),
        {
          'op cursor-not-allowed text-black/60': disabled || readonly,
        },
        props.class,
        {
          'border-destructive': error?.length,
        },
        { peer: hasFloatLabel },
      )
    "
  />
</template>
