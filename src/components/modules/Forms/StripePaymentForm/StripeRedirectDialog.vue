<template>
  <Dialog :open="isOpen">
    <DialogContent class="max-h-screen overflow-scroll sm:max-w-[500px]" hideClose>
      <DialogHeader>
        <DialogTitle
          class="my-4 text-balance text-center font-Matter text-5xl font-light uppercase"
        >
          {{ dialogTitle }}
        </DialogTitle>
        <DialogDescription
          class="text-balance text-center font-Matter text-base font-light lg:text-lg"
        >
          {{ dialogDescription }}
        </DialogDescription>
      </DialogHeader>
      <Loader2 v-if="loading" class="mx-auto my-10 h-8 w-8 animate-spin dark:stroke-white" />
      <div v-else>
        <Button :loading="loading" :disabled="loading" class="w-full" @click="isOpen = false">
          {{ t('stripeRedirect.button') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { storeToRefs } from 'pinia';
import { useFanStore } from '@stores/fan.store';
import { useRoute, useRouter, type LocationQuery } from 'vue-router';

import { Loader2 } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui/dialog';
import Button from '@ui/button/Button.vue';

const { t } = useTranslation();

const route = useRoute();
const router = useRouter();
const fanStore = useFanStore();
const { fanId, fanSubscriptionId } = storeToRefs(fanStore);

const isOpen = ref(false);
const loading = ref(true);
const dialogTitle = ref(t('stripeRedirect.title'));
const dialogDescription = ref(t('stripeRedirect.description'));

const handleStripeParams = async (query: LocationQuery) => {
  const {
    payment_intent,
    payment_intent_client_secret,
    redirect_status,
    tierId,
    ...restOfTheQuery
  } = query;
  if (payment_intent && payment_intent_client_secret && redirect_status && tierId) {
    isOpen.value = true;
  } else {
    return;
  }

  router.replace({ query: restOfTheQuery || {} }); // preserves other params if any

  if (redirect_status === 'succeeded') {
    while (tierId && fanSubscriptionId.value !== tierId) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        await fanStore.fanGet();
      } catch (error) {
        console.error('Error fetching fan data:', error);
        break;
      }
    }
    dialogTitle.value = t('stripeRedirect.success');
    dialogDescription.value = t('stripeRedirect.successDescription');
    loading.value = false;
  } else {
    dialogTitle.value = t('stripeRedirect.error');
    dialogDescription.value = t('stripeRedirect.errorDescription');
    loading.value = false;
  }
};

watch(
  () => fanId.value,
  () => {
    if (fanId.value) handleStripeParams(route.query);
  },
  { immediate: true },
);
</script>
