<template>
  <div class="-mb-10 pt-20">
    <div class="relative">
      <div class="container relative z-10">
        <div class="mx-auto mt-8 pb-32 lg:max-w-lg">
          <EnhancedUserForm />
          <div
            class="mb-6 mt-9 flex items-center justify-between border-t border-black/10 pt-8 dark:border-white/40"
          >
            <h3 class="title-md dark:text-white">{{ t('profile.membership') }}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger
                class="flex items-center gap-x-2 rounded-full border border-black/40 px-3 py-1 transition-colors hover:border-black hover:bg-black/5"
              >
                <Cog class="size-6" />
                <span class="font-Matter-Medium text-base uppercase">{{
                  t('profile.manageTier')
                }}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56 border-white/20 bg-black text-white" align="end">
                <DropdownMenuItem class="cursor-pointer" @click="openPaymentDetailsDialog = true">
                  <CreditCard class="size-4 stroke-white" />
                  <span class="whitespace-nowrap font-Matter-Medium text-sm uppercase text-white">{{
                    t('profile.paymentDetails')
                  }}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="!cancellationRequestedAndPending"
                  class="cursor-pointer"
                  @click="openCancelSubscriptionDialog = true"
                >
                  <Ban class="size-4 stroke-white" />
                  <span class="whitespace-nowrap font-Matter-Medium text-sm uppercase text-white"
                    >{{ t('membership.cancelSubscription') }}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <template v-if="!showPayment">
            <div class="grid gap-y-4">
              <MembershipCard
                v-for="tier in sortedTiers"
                :key="tier.id"
                class="h-full"
                appearance="sm"
                :tier="tier"
                @showPayment="handleShowPayment"
              />
            </div>
            <InfoBar
              v-if="paymentSuccess"
              variant="success"
              class="my-4"
              :title="t('common.success')"
              :message="t('membership.success')"
              @close="paymentSuccess = null"
            />
            <p
              v-if="cancellationRequestedAndPending"
              class="mx-auto mt-6 text-center text-sm dark:text-white/60 md:max-w-lg"
            >
              {{
                t('profile.membershipCancelled', {
                  date: formatDate(fanSubscriptionCancelledAt || ''),
                })
              }}
            </p>
          </template>
          <template v-else>
            <TierTag
              v-if="selectedTier"
              :tier="selectedTier"
              :is-active="true"
              class="mx-auto mt-6 w-full max-w-sm"
            />
            <div
              class="mx-auto mb-3 mt-4 w-fit cursor-pointer underline underline-offset-2 dark:text-white"
              @click="showPayment = false"
            >
              {{ t('signUp.membershipOptions') }}
            </div>
            <div class="payment-text my-4 text-center" v-html="paymentAmount" />
            <StripePaymentForm @close="closePaymentForm" @cancel="cancelPaymentForm" />
          </template>
        </div>
      </div>
    </div>
    <CancelSubscription
      :isOpen="openCancelSubscriptionDialog"
      @update:open="openCancelSubscriptionDialog = false"
    />
    <PaymentDetails
      :isOpen="openPaymentDetailsDialog"
      @update:open="openPaymentDetailsDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { storeToRefs } from 'pinia';
import { useFanStore } from '@stores/fan.store';
import { useTierStore } from '@stores/tier.store';
import { useTranslation } from '@/locales/i18n';

import { Cog, CreditCard, Ban } from 'lucide-vue-next';
import InfoBar from '@generics/InfoBar.vue';
import MembershipCard from '@modules/Memberships/MembershipCard.vue';
import StripePaymentForm from '@modules/Forms/StripePaymentForm/StripePaymentForm.vue';
import TierTag from '@modules/Memberships/TierTag.vue';
import EnhancedUserForm from '@modules/Forms/EnhancedUserForm.vue';
import CancelSubscription from '@modules/Dialogs/CancelSubscription.vue';
import PaymentDetails from '@modules/Dialogs/PaymentDetails.vue';

definePage({
  name: 'Account',
  meta: {
    requiresAuth: true,
    bgColor: 'white',
  },
});

const { t } = useTranslation();
const tierStore = useTierStore();
const fanStore = useFanStore();
const { liveTiers, selectedTier } = storeToRefs(tierStore);
const { fanSubscriptionCancelledAt, cancellationRequestedAndPending } = storeToRefs(fanStore);
const { activeTier } = storeToRefs(tierStore);

// Refs
const showPayment = ref(false);
const paymentSuccess = ref<string | null>(null);
const openCancelSubscriptionDialog = ref(false);
const openPaymentDetailsDialog = ref(false);

// Computed
const sortedTiers = computed(() => {
  if (!liveTiers.value || !activeTier.value) return liveTiers.value;

  const activeTierData = liveTiers.value.find((tier) => tier.id === activeTier.value?.id);
  const otherTiers = liveTiers.value.filter((tier) => tier.id !== activeTier.value?.id);

  return activeTierData ? [activeTierData, ...otherTiers] : liveTiers.value;
});

const paymentAmount = computed(() => {
  if (!selectedTier.value) return '';
  return `£${selectedTier.value.price}/${period.value}`;
});

const period = computed(() => {
  return selectedTier.value?.period === 'month' ? t('common.monthly') : t('common.yearly');
});

// Methods
const handleShowPayment = () => {
  showPayment.value = true;
};

const closePaymentForm = () => {
  showPayment.value = false;
  paymentSuccess.value = t('membership.success');
};

const cancelPaymentForm = () => {
  showPayment.value = false;
  tierStore.resetSelectedTier();
};

const formatDate = (date: string) => format(parseISO(date), 'EEE do MMM');

onMounted(async () => {
  await tierStore.fetchTierList();
});
</script>
