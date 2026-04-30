<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="max-h-screen sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="mb-1 text-2xl uppercase">{{ t('input.location.title') }}</DialogTitle>
        <DialogDescription class="text-balance">{{
          t('input.location.description')
        }}</DialogDescription>
      </DialogHeader>
      <div class="form-wrapper">
        <LocationCombobox
          v-model="selectedLocation"
          :label="label"
          :name="name"
          :disabled="disabled"
          :variant="variant"
          :placeholder="t('input.location.placeholder')"
          :empty-message="t('input.location.emptyList')"
          @change="onLocationChange"
        />
        <div class="mt-4 flex gap-2">
          <Button
            type="button"
            :disabled="!selectedLocation"
            class="flex-1"
            @click="confirmLocation"
          >
            {{ t('common.confirm') }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FanLocation } from '@/api/fan.api';
import Button from '@ui/button/Button.vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import { useTranslation } from '@/locales/i18n';
import { type LabelVariants } from '@ui/label/index';
import LocationCombobox from '@modules/Inputs/LocationCombobox/LocationCombobox.vue';

interface LocationDialogProps {
  label: string;
  name: string;
  disabled?: boolean;
  variant?: LabelVariants['variant'];
}

const props = withDefaults(defineProps<LocationDialogProps>(), {
  disabled: false,
  variant: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: FanLocation | undefined];
  change: [value: FanLocation | undefined];
}>();

const { t } = useTranslation();

const isOpen = defineModel<boolean>('modelValue', {
  required: true,
});

const modelValue = defineModel<FanLocation | undefined>('location', {
  required: true,
});

const selectedLocation = ref<FanLocation | undefined>();

const onLocationChange = (location: FanLocation | undefined) => {
  selectedLocation.value = location;
  modelValue.value = location;
};

const confirmLocation = () => {
  if (selectedLocation.value) {
    modelValue.value = selectedLocation.value;
    emit('change', selectedLocation.value);
    onOpenChange(false);
  }
};

const onOpenChange = (open: boolean) => {
  if (props.disabled) return;
  isOpen.value = open;
};
</script>
