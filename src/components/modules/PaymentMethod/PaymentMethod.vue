<template>
  <div
    class="relative flex aspect-video flex-col justify-between rounded-xl border border-black/30 bg-black/10 p-6 text-white shadow-xl"
  >
    <div class="flex items-center justify-between">
      <CardBrandIcon :brand="paymentMethod.brand?.toLowerCase()" />
      <span
        v-if="paymentMethod.defaultPaymentMethod"
        class="rounded-full bg-green px-3 py-1 text-xs font-bold text-black"
        >{{ t('paymentMethods.default') }}</span
      >
      <span
        v-else-if="isSettingAsDefault"
        class="bg-orange-200 rounded-full px-3 py-1 text-xs font-bold text-black"
        >{{ t('paymentMethods.settingAsDefault') }}</span
      >
      <button
        v-else-if="!disabled"
        class="rounded bg-black/90 px-2 py-1 text-xs text-white transition hover:bg-black/70"
        @click="emit('setAsDefault')"
      >
        {{ t('paymentMethods.setAsDefault') }}
      </button>
    </div>
    <div class="flex flex-col gap-2">
      <div class="font-mono text-xl tracking-widest dark:text-white sm:text-2xl">
        **** **** **** {{ paymentMethod.last4digits }}
      </div>
      <div class="mt-2 flex items-center justify-between text-sm dark:text-white">
        <span class="dark:text-white">
          {{ t('paymentMethods.expiry') }}
          {{ paymentMethod.expiresMonth.toString().padStart(2, '0') }}/{{
            paymentMethod.expiresYear
          }}
        </span>
        <button
          v-if="!isOnlyOne && !paymentMethod.defaultPaymentMethod && !disabled"
          class="rounded bg-black/10 px-2 py-1 text-xs text-white transition hover:bg-black/20"
          @click="emit('deletePaymentMethod')"
        >
          {{ t('paymentMethods.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMethod as PaymentMethodType } from '@/api/paymentMethod.api';
import CardBrandIcon from './CardBrandIcon.vue';
import { useTranslation } from '@/locales/i18n';

defineProps<{
  paymentMethod: PaymentMethodType;
  isOnlyOne?: boolean;
  disabled?: boolean;
  isSettingAsDefault?: boolean;
}>();

const emit = defineEmits(['setAsDefault', 'editPaymentMethod', 'deletePaymentMethod']);

const { t } = useTranslation();
</script>
