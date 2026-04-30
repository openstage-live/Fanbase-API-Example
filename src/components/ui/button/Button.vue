<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/common';
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { type ButtonVariants, buttonVariants } from '.';

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="
      cn(buttonVariants({ variant, size }), props.class, {
        'pointer-events-none opacity-50': disabled,
      })
    "
  >
    <slot />
  </Primitive>
</template>
