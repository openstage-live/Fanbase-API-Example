<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { ref, computed, useAttrs } from 'vue';
import { cn } from '@/utils/common';
import { X } from 'lucide-vue-next';
import { useVModel } from '@vueuse/core';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  class?: HTMLAttributes['class'];
  defaultValue?: string | number;
  modelValue?: string | number;
  clearable?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const attrs = useAttrs();
const showClearButton = computed(() => {
  const isDisabled = Boolean(attrs['disabled']);
  const isReadonly = Boolean(attrs['readonly']);
  const hasValue = String(modelValue.value ?? '') !== '';
  return props.clearable && hasValue && !isDisabled && !isReadonly;
});

const onClear = () => {
  modelValue.value = '';
  textareaRef.value?.focus();
};

// Expose focus method and ref for parent components (e.g., iOS programmatic focus)
const focus = () => {
  // preventScroll helps avoid iOS scroll jumps that can blur the input
  textareaRef.value?.focus({ preventScroll: true });
};

defineExpose({
  focus,
  textareaRef,
});
</script>

<template>
  <div class="relative">
    <textarea
      ref="textareaRef"
      v-model="modelValue"
      v-bind="$attrs"
      @focus="focus"
      :class="
        cn(
          'flex min-h-[60px] w-full rounded-md border border-input/20 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-input/100 focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          showClearButton ? 'pr-10' : '',
          props.class,
        )
      "
    />

    <button
      v-if="showClearButton"
      type="button"
      class="absolute right-2 top-2 transition-transform hover:scale-110"
      aria-label="Clear text"
      @mousedown.prevent
      @click="onClear"
    >
      <X class="h-4 w-4 stroke-white" />
    </button>
  </div>
</template>
