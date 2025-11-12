<template>
  <div v-if="loading" class="flex justify-center py-4">
    <Loader2 class="h-8 w-8 animate-spin" />
  </div>
  <div v-show="isPaymentElementReady" class="flex flex-col gap-3">
    <div
      id="payment-element"
      ref="paymentElement"
      :class="{ 'pointer-events-none opacity-70': isSubmitting }"
    ></div>
    <InfoBar
      v-if="paymentError"
      variant="destructive"
      :title="t('common.error')"
      :message="paymentError || t('common.tryAgain')"
      @close="paymentError = null"
    />
    <Button
      @click="submit"
      :loading="isSubmitting"
      :disabled="isSubmitting"
      variant="secondary"
      class="mt-4 self-center"
    >
      <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin stroke-white" />
      {{ t('common.save') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { usePaymentMethodStore } from '@stores/paymentMethod.store';
import { useTranslation } from '@/locales/i18n';
import { Loader2 } from 'lucide-vue-next';
import Button from '@ui/button/Button.vue';
import InfoBar from '@generics/InfoBar.vue';
import { storeToRefs } from 'pinia';
import { useArtistStore } from '@/stores/artist.store';
import stripeFormAppearance from './stripeForm.constants';
import { env } from '@/env';

const { t } = useTranslation();
const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const clientSecret = ref<string | null>(null);
const paymentElement = ref<HTMLElement | null>(null);
const paymentError = ref<string | null>(null);
const loading = ref(true);
const isSubmitting = ref(false);
const isPaymentElementReady = ref(false);

const emit = defineEmits(['success', 'close']);

const paymentMethodStore = usePaymentMethodStore();
const { paymentMethodClientSecret } = storeToRefs(paymentMethodStore);

const artistStore = useArtistStore();
const { stripeConnectId } = storeToRefs(artistStore);

const getStripeInstance = async () => {
  if (!stripeConnectId.value) {
    console.error('No Stripe Connect ID found');
    return null;
  }

  const stripeInstance = await loadStripe(env.VITE_STRIPE_PK, {
    stripeAccount: stripeConnectId.value,
  });
  return stripeInstance;
};

onMounted(async () => {
  try {
    // Get SetupIntent clientSecret from API
    await paymentMethodStore.createPaymentMethod();
    clientSecret.value = paymentMethodClientSecret.value;
    if (!clientSecret.value) {
      paymentError.value = t('common.error');
      loading.value = false;
      return;
    }

    stripe.value = await getStripeInstance();

    if (stripe.value && clientSecret.value && paymentElement.value) {
      elements.value = stripe.value.elements({
        clientSecret: clientSecret.value,
        appearance: stripeFormAppearance,
      });
      const paymentEl = elements.value.create('payment');
      paymentEl.mount(paymentElement.value as unknown as HTMLElement);
      await nextTick();
      isPaymentElementReady.value = true;
    }
    loading.value = false;
  } catch (error) {
    paymentError.value = error as string;
    loading.value = false;
  }
});

onUnmounted(() => {
  if (elements.value) {
    const payment = elements.value.getElement('payment');
    if (payment) {
      payment.unmount();
    }
  }
});

const submit = async () => {
  paymentError.value = null;
  if (isSubmitting.value || !stripe.value || !clientSecret.value || !elements.value) {
    return;
  }
  isSubmitting.value = true;
  const { error } = await stripe.value.confirmSetup({
    elements: elements.value,
    confirmParams: {
      return_url: window.location.href,
    },
    redirect: 'if_required',
  });
  if (error) {
    paymentError.value = error.message as string;
    isSubmitting.value = false;
    return;
  }
  emit('success');
  isSubmitting.value = false;
};
</script>
