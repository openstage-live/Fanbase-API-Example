<template>
  <div ref="inputWrapper" class="input-wrapper" v-bind="$attrs">
    <div class="relative" :class="(!hasFloatLabel && 'flex flex-col-reverse gap-2') || 'mt-4'">
      <Label
        :for="name"
        :variant="variant"
        :class="[
          'pointer-events-none px-2 text-sm',
          variant === 'ghost' ? 'bg-black' : 'bg-transparent',
          errorInput && '!text-destructive',
          hasFloatLabel &&
            'absolute start-1 top-2 z-10 origin-[0] -translate-y-7 scale-75 transform rounded-tl-lg rounded-tr-lg bg-white duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:bg-background/100 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4',
        ]"
      >
        {{ label }}
      </Label>
      <div class="w-full">
        <div class="relative">
          <Button
            type="button"
            variant="input"
            :class="[errorInput && 'border-destructive', !modelValue && 'text-muted-foreground']"
            :disabled="disabled"
            @click="openDialog"
          >
            <span class="dark:text-white">
              {{ displayLocation }}
            </span>
            <EditButton class="absolute right-2 min-h-6 min-w-6" />
          </Button>
        </div>
      </div>
      <span v-if="errorInput" class="input-error">{{ errorInput }}</span>
    </div>
  </div>

  <LocationDialog
    v-model="isDialogOpen"
    v-model:location="modelValue"
    :label="label"
    :name="name"
    :variant="variant"
    :disabled="disabled"
    @change="onLocationChange"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FanLocation } from '@/api/fan.api';
import Button from '@ui/button/Button.vue';
import Label from '@ui/label/Label.vue';
import { type LabelVariants } from '@ui/label/index';
import EditButton from '@generics/Buttons/EditButton.vue';
import LocationDialog from '@modules/Dialogs/LocationDialog.vue';

interface InputProps {
  label: string;
  placeholder: string;
  name: string;
  type?: string;
  errorInput?: string;
  disabled?: boolean;
  hasFloatLabel?: boolean;
  variant?: LabelVariants['variant'];
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  errorInput: undefined,
  disabled: false,
  hasFloatLabel: true,
  variant: 'default',
});

const emit = defineEmits(['update:modelValue', 'change', 'input', 'blur']);

const isDialogOpen = ref(false);
const inputWrapper = ref<HTMLElement | null>(null);

const modelValue = defineModel<FanLocation | undefined>('modelValue', {
  required: true,
});

// Methods
const openDialog = () => {
  if (!props.disabled) {
    isDialogOpen.value = true;
  }
};

const onLocationChange = (location: FanLocation | undefined) => {
  emit('change', location);
};

// Computed
const displayLocation = computed(() => {
  return modelValue.value?.city || props.placeholder;
});
</script>
