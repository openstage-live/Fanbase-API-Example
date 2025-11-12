<template>
  <div class="input-wrapper">
    <div class="input-decorator-wrapper flex w-full" :class="hasFloatLabel && 'mt-3'">
      <div class="relative w-full" :class="!hasFloatLabel && 'flex flex-col-reverse gap-2'">
        <Input
          v-model="modelValue"
          v-bind="$attrs"
          :name="name"
          :type="type"
          :error="error"
          placeholder=""
          :readonly="readonly"
          :variant="variant"
          :class="hasAppend && 'rounded-e-none'"
          @focus="onFocus"
          :autocomplete="autocomplete"
          :validation-rules="validationRules"
        />
        <Label
          :for="name"
          :class="[
            'pointer-events-none rounded-tl-md rounded-tr-md bg-transparent px-2 text-sm dark:bg-black dark:text-white',
            error && '!text-destructive',
            hasFloatLabel &&
              'absolute start-1 top-2 z-10 origin-[0] -translate-y-7 scale-75 transform duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4',
          ]"
          >{{ label || placeholder }}{{ required ? ' *' : ''
          }}{{ (readonly && ` (${t('input.label.readonly')})`) || '' }}</Label
        >
      </div>
      <EditButton
        v-if="hasEditButton"
        :is-editing="hasValueChanged"
        :is-loading="isLoading"
        @click="$emit('submit')"
        class="absolute right-0 top-0"
      />
      <div
        v-if="$slots.append"
        class="flex h-10 items-center rounded-e-lg border-y border-none text-sm font-normal shadow-sm transition-colors hover:bg-background/10 focus:border-input/100 focus:outline-none focus:ring-0 focus:ring-transparent disabled:cursor-not-allowed disabled:opacity-50"
        :class="error && 'border-destructive'"
      >
        <slot name="append" />
      </div>
    </div>
    <span class="input-error mt-1" v-if="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, type VNode, ref, watch } from 'vue';
import Input from '@ui/input/Input.vue';
import Label from '@ui/label/Label.vue';
import EditButton from '@generics/Buttons/EditButton.vue';
import { useTranslation } from '@/locales/i18n';
import { type InputVariants } from '@ui/input/index';

interface InputProps {
  label: string;
  placeholder: string;
  name: string;
  type?: string;
  error?: string;
  hasFloatLabel?: boolean;
  readonly?: boolean;
  variant?: InputVariants['variant'];
  hasEditButton?: boolean;
  isLoading?: boolean;
  submitSuccessful?: boolean;
  autocomplete?: string;
  required?: boolean;
  validationRules?: string | Record<string, unknown> | ((value: unknown) => boolean | string);
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  error: undefined,
  hasFloatLabel: true,
  readonly: false,
  hasEditButton: false,
  isLoading: false,
  submitSuccessful: false,
  autocomplete: undefined,
  required: false,
  validationRules: undefined,
});

const modelValue = defineModel<string | undefined>('modelValue', {
  required: true,
});

defineEmits<{
  submit: [];
}>();

const slots = defineSlots<{
  append?: () => VNode;
}>();

const { t } = useTranslation();

const originalValue = ref<string | undefined>(undefined);
const hasUserInteracted = ref<boolean>(false);

const hasValueChanged = computed(() => {
  return hasUserInteracted.value && modelValue.value !== originalValue.value;
});
const hasAppend = computed(() => !!slots.append);

const onFocus = () => {
  if (!hasUserInteracted.value) {
    originalValue.value = modelValue.value;
    hasUserInteracted.value = true;
  }
};

watch(
  () => modelValue.value,
  (newValue) => {
    if (
      !hasUserInteracted.value &&
      originalValue.value === undefined &&
      newValue !== undefined &&
      newValue !== ''
    ) {
      originalValue.value = newValue;
    }
  },
);

watch(
  () => props.submitSuccessful,
  (isSuccessful) => {
    if (isSuccessful) {
      originalValue.value = modelValue.value;
    }
  },
);
</script>
