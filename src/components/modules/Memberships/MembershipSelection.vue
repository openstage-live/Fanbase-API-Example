<template>
  <template v-if="!showPayment">
    <InfoBar
      v-if="paymentSuccess"
      variant="success"
      class="mt-4"
      :title="t('common.success')"
      :message="t('membership.success')"
      @close="paymentSuccess = null"
    />
    <Memberships
      :layout="memberShipVariant"
      @showPayment="showPayment = true"
      @skipForNow="skipForNow"
    />
  </template>
  <template v-else>
    <TierTag
      v-if="selectedTier"
      :tier="selectedTier"
      :is-active="true"
      class="mx-auto w-full max-w-sm"
    />
    <div
      class="mx-auto w-fit cursor-pointer underline underline-offset-2 dark:text-white"
      @click="showPayment = false"
    >
      {{ t('signUp.membershipOptions') }}
    </div>
    <div class="payment-text text-center" v-html="paymentAmount" />
    <StripePaymentForm @close="closePaymentForm" @cancel="cancelPaymentForm" />
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { storeToRefs } from 'pinia';
import { useTierStore } from '@stores/tier.store';
import { useRouter, useRoute } from 'vue-router';
import { useFanTracking } from '@/composables/useFanTracking';

import InfoBar from '@generics/InfoBar.vue';
import Memberships from '@modules/Memberships/Memberships.vue';
import StripePaymentForm from '@modules/Forms/StripePaymentForm/StripePaymentForm.vue';
import TierTag from '@modules/Memberships/TierTag.vue';

const { t } = useTranslation();
const tierStore = useTierStore();
const { selectedTier } = storeToRefs(tierStore);
const router = useRouter();
const route = useRoute();
const fanTracking = useFanTracking();

const emit = defineEmits<{
  showPaymentChange: [value: boolean];
}>();

const showPayment = ref(false);
const paymentSuccess = ref<string | null>(null);

const memberShipVariant = computed(() => (route.name === 'SignUp' ? 'tabs' : 'cards'));
const paymentAmount = computed(() => {
  const isFree = selectedTier.value?.price === 0;
  return isFree
    ? t('signUp.paymentAmountFree', {
        tierPeriod: selectedTier.value?.period || '',
      })
    : t('signUp.paymentAmount', {
        tierPrice: selectedTier.value?.price || 0,
        tierPeriod: selectedTier.value?.period || '',
      });
});

// Watch for changes in showPayment and emit to parent
watch(showPayment, (newValue) => {
  emit('showPaymentChange', newValue);
});

watch(
  selectedTier,
  (newValue) => {
    if (newValue) fanTracking.trackTierToggled(newValue.tag);
  },
  { immediate: true },
);

const cancelPaymentForm = () => {
  showPayment.value = false;
  paymentSuccess.value = null;
};

const closePaymentForm = () => {
  showPayment.value = false;
  paymentSuccess.value = t('membership.success');
  if (route.name === 'SignUp') {
    router.push({ name: 'Home' });
  }
};

const skipForNow = () => {
  showPayment.value = false;
  router.push({ name: 'Home' });
};

onMounted(() => {
  paymentSuccess.value = null;
  tierStore.resetSelectedTier();
});
</script>

<style lang="postcss">
.payment-text {
  @apply dark:text-white;
  span {
    @apply font-Matter-Bold dark:text-white;
  }
}
</style>
