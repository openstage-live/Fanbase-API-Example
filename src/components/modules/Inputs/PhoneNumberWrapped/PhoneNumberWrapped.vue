<template>
  <div class="input-wrapper">
    <div class="relative" :class="(!hasFloatLabel && 'flex flex-col-reverse gap-2') || 'mt-4'">
      <Label
        :for="name"
        :variant="variant"
        :class="[
          'pointer-events-none px-2 text-sm',
          variant === 'ghost' ? 'bg-black' : 'bg-transparent',
          error && 'text-destructive',
          hasFloatLabel &&
            'absolute start-1 top-2 z-10 origin-[0] -translate-y-7 scale-75 transform rounded-tl-md rounded-tr-md duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:px-2 peer-focus:!text-white/100 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4',
        ]"
        >{{ label }}</Label
      >
      <PhoneNumberInput
        v-model="modelValue"
        placeholder="Phone number"
        :error="error"
        :variant="variant"
        :disabled="disabled"
      />
    </div>
    <span class="input-error" v-if="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import Label from '@ui/label/Label.vue';
import PhoneNumberInput from './PhoneNumberInput.vue';
import { type LabelVariants } from '@ui/label/index';

interface PhoneNumberProps {
  label: string;
  placeholder: string;
  name: string;
  error?: string;
  disabled?: boolean;
  hasFloatLabel?: boolean;
  variant?: LabelVariants['variant'];
}

withDefaults(defineProps<PhoneNumberProps>(), {
  type: 'text',
  error: undefined,
  hasFloatLabel: true,
});

const modelValue = defineModel<string | undefined>('modelValue', {
  required: true,
});
</script>
