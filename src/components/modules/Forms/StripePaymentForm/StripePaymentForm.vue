<template>
  <div v-if="subscriptionUpgradeInProgress" class="flex justify-center py-4">
    <Loader2 class="h-8 w-8 animate-spin" :class="{ 'stroke-white': isDarkMode }" />
  </div>
  <div v-else-if="showConfirmPrompt">
    <div class="flex flex-col gap-4">
      <InfoBar
        class="border border-black/20 bg-black/10 text-center text-black dark:border-white/20 dark:bg-white/10 dark:text-white"
        variant="default"
        :title="upgradePromptTitle"
        :message="upgradePromptMessage"
      />
      <div class="flex justify-center gap-4">
        <Button variant="secondary" @click="cancelSwitch">{{ t('common.cancel') }}</Button>
        <Button @click="confirmSubscribe">{{ t('membership.confirmChange') }}</Button>
      </div>
    </div>
  </div>
  <div
    v-show="isPaymentElementReady && !showConfirmPrompt"
    class="mx-auto flex w-full max-w-lg flex-col gap-3"
  >
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
    <Button @click="submit" :loading="isSubmitting" :disabled="isSubmitting">
      <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin stroke-white" />
      {{ t('common.continue') }}
    </Button>
  </div>
  <InfoBar
    v-if="subscribeError"
    variant="destructive"
    :title="t('common.error')"
    :message="subscribeError"
    @close="subscribeError = null"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { storeToRefs } from 'pinia';
import { useArtistStore } from '@stores/artist.store';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@/composables/useFanTracking';
import { useTierStore } from '@stores/tier.store';
import { usePaymentMethodStore } from '@stores/paymentMethod.store';
import { useTranslation } from '@/locales/i18n';
import { postTelemetry } from '@/api/tracking.api';

import { Loader2 } from 'lucide-vue-next';
import Button from '@ui/button/Button.vue';
import InfoBar from '@generics/InfoBar.vue';
import stripeFormAppearance from './stripeForm.constants';
import { env } from '@/env';

const emit = defineEmits(['close', 'cancel']);

const { t } = useTranslation();
const fanStore = useFanStore();
const fanTracking = useFanTracking();
const artistStore = useArtistStore();
const tierStore = useTierStore();
const { stripeConnectId } = storeToRefs(artistStore);
const { subscribeData, subscribeError, fanSubscriptionId, subscriptionUpgradeInProgress } =
  storeToRefs(fanStore);
const { selectedTier, activeTier } = storeToRefs(tierStore);

const stripe = ref<Stripe | null>(null);
const elements = ref<StripeElements | null>(null);
const clientSecret = ref<string | null>(null);
const paymentElement = ref<HTMLElement | null>(null);
const paymentError = ref<string | null>(null);
const isSubmitting = ref(false);
const isPaymentElementReady = ref(false);
const initialFanSubscriptionId = fanSubscriptionId.value || activeTier.value?.id;

const paymentMethodStore = usePaymentMethodStore();
const { paymentMethodList } = storeToRefs(paymentMethodStore);

const isDarkMode = computed(() => document.body.classList.contains('dark'));

const getStripeInstance = async () => {
  if (!stripeConnectId) {
    console.error('No Stripe Connect ID found');
    return null;
  }

  const stripeInstance = await loadStripe(env.VITE_STRIPE_PK, {
    stripeAccount: stripeConnectId.value,
  });

  return stripeInstance;
};

const submit = async () => {
  paymentError.value = null;
  if (isSubmitting.value || !stripe.value || !clientSecret.value || !elements.value) {
    console.error('Missing required values', {
      isSubmitting: isSubmitting.value,
      stripe: stripe.value,
      elements: elements.value,
      clientSecret: clientSecret.value,
    });
    return;
  }
  isSubmitting.value = true;
  const elementsResult = await elements.value.submit();
  if (elementsResult.error) {
    console.error('Elements error', elementsResult.error);
    paymentError.value = elementsResult.error.message as string;
    isSubmitting.value = false;
    return;
  }
  const { error } = await stripe.value.confirmPayment({
    elements: elements.value,
    clientSecret: clientSecret.value,
    confirmParams: {
      return_url: window.location.href + '?tierId=' + selectedTier.value?.id,
    },
    redirect: 'if_required',
  });
  if (error) {
    console.error('Payment error', error);
    paymentError.value = error.message as string;
    isSubmitting.value = false;
    return;
  }

  while (fanSubscriptionId.value === initialFanSubscriptionId) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      await fanStore.fanGet();
    } catch (error) {
      console.error('Error fetching fan data:', error);
      break;
    }
  }
  isSubmitting.value = false;
  emit('close');
};

const confirmSubscribe = async () => {
  subscriptionUpgradeInProgress.value = true;
  showConfirmPrompt.value = false;
  try {
    await fanStore.subscribe(selectedTier.value?.id || '');

    const isUpgrade =
      activeTier.value && selectedTier.value && selectedTier.value.price > activeTier.value.price;

    if (isUpgrade) {
      postTelemetry({
        metric: 'upgrade',
        resource: selectedTier.value.id,
      });
    }

    if (subscribeError.value) {
      subscriptionUpgradeInProgress.value = false;
      return;
    }

    if (
      !subscribeData.value ||
      !('clientSecret' in subscribeData.value) ||
      !subscribeData.value?.clientSecret ||
      subscribeData.value?.clientSecret === 'free'
    ) {
      isSubmitting.value = true;
      while (fanSubscriptionId.value === initialFanSubscriptionId) {
        await new Promise((r) => setTimeout(r, 1000));
        try {
          await fanStore.fanGet();
        } catch (error) {
          console.error('Error fetching fan data:', error);
          break;
        }
      }
      isSubmitting.value = false;
      emit('close');
      return;
    }

    // otherwise, mount payment form element
    const stripeInstance = await getStripeInstance();
    stripe.value = stripeInstance;
    clientSecret.value = subscribeData.value.clientSecret;

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
    subscriptionUpgradeInProgress.value = false;
  } catch (error) {
    console.error('Error loading Stripe:', error);
    paymentError.value = error as string;
    subscriptionUpgradeInProgress.value = false;
  }
};

const showConfirmPrompt = ref(false);
const upgradePromptTitle = computed(() => {
  return 'Your existing card on file will be used to pay for your new membership.';
});
const upgradePromptMessage = computed(() => {
  return 'This will be effective immediately, please confirm.';
});
const cancelSwitch = () => {
  showConfirmPrompt.value = false;
  emit('cancel');
};

watch(isPaymentElementReady, (newValue) => {
  if (newValue) fanTracking.trackPaymentFormLoaded(selectedTier.value?.tag || '');
});

onMounted(async () => {
  subscriptionUpgradeInProgress.value = true;

  if (fanSubscriptionId.value) {
    showConfirmPrompt.value = true;
    subscriptionUpgradeInProgress.value = false;
    return;
  }

  if (!paymentMethodList.value?.length) {
    await paymentMethodStore.fetchPaymentMethodList();
  }

  if (paymentMethodList.value?.length) {
    showConfirmPrompt.value = true;
    subscriptionUpgradeInProgress.value = false;
    return;
  }

  confirmSubscribe();
});

onUnmounted(() => {
  if (elements.value) {
    const payment = elements.value.getElement('payment');
    if (payment) {
      payment.unmount();
    }
  }
});
</script>
