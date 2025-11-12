<template>
  <div class="checkbox-wrapper">
    <Checkbox
      :id="name"
      v-bind="$attrs"
      :name="name"
      v-model="modelValue"
      :class="{
        'border-destructive': error,
      }"
    />
    <Label
      :for="name"
      :variant="variant"
      :class="error && 'text-destructive'"
      class="ml-1 text-balance text-xs"
      >{{ label }}</Label
    >
  </div>
  <span class="input-error" v-if="error">{{ error }}</span>
</template>

<script setup lang="ts">
import { Checkbox } from '@ui/checkbox';
import Label from '@ui/label/Label.vue';
import { type LabelVariants } from '@ui/label/index';

interface CheckboxProps {
  label: string;
  name: string;
  error?: string;
  variant?: LabelVariants['variant'];
}

withDefaults(defineProps<CheckboxProps>(), {
  error: undefined,
});

const modelValue = defineModel<boolean>('modelValue', {
  required: true,
});
</script>
