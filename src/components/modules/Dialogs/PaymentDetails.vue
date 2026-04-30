<template>
  <Dialog :open="isOpen" @update:open="emit('update:open', false)">
    <DialogContent class="max-h-[90dvh] bg-white p-8">
      <DialogHeader>
        <DialogTitle class="mb-1 font-Matter-Bold text-2xl uppercase tracking-normal">
          {{ t('profile.paymentDetailsDialog.title') }}
        </DialogTitle>
        <DialogDescription class="text-balance text-sm text-muted-foreground">
          {{ t('profile.paymentDetailsDialog.description') }}
        </DialogDescription>
      </DialogHeader>
      <div class="my-4">
        <PaymentMethods />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import PaymentMethods from '@modules/PaymentMethod/PaymentMethods.vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['update:open']);

const { t } = useTranslation();
</script>
