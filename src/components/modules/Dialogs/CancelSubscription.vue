<template>
  <Dialog :open="isOpen" @update:open="emit('update:open', false)">
    <DialogContent class="bg-white p-8">
      <DialogHeader>
        <DialogTitle class="mb-1 font-Matter-Bold text-2xl uppercase tracking-normal">
          {{ t('membership.cancelSubscription') }}
        </DialogTitle>
        <DialogDescription class="text-balance text-sm text-muted-foreground">
          {{ t('membership.cancelSubscriptionDescription') }}
        </DialogDescription>
      </DialogHeader>
      <Button
        class="mt-4"
        @click="cancelSubscription"
        :disabled="isUnsubscribeFetching"
        :loading="isUnsubscribeFetching"
      >
        <Loader2 v-if="isUnsubscribeFetching" class="h-4 w-4 animate-spin stroke-white" />
        {{ t('membership.cancelSubscription') }}
      </Button>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import { Button } from '@ui/button';
import { useFanStore } from '@/stores/fan.store';
import { storeToRefs } from 'pinia';
import { useTranslation } from '@/locales/i18n';
import { useTierStore } from '@/stores/tier.store';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['update:open']);

const { t } = useTranslation();
const fanStore = useFanStore();
const { isUnsubscribeFetching, unsubscribeData, unsubscribeError } = storeToRefs(fanStore);
const tierStore = useTierStore();

const cancelSubscription = async () => {
  unsubscribeData.value = null;
  unsubscribeError.value = null;
  await fanStore.unsubscribe();

  emit('update:open', false);

  if (unsubscribeError.value) {
    console.log('unsubscribeError', unsubscribeError.value);
    return;
  }

  tierStore.resetSelectedTier();
};
</script>
