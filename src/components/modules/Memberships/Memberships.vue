<template>
  <Loader2
    v-if="isTierListFetching || isSubmitting"
    class="mx-auto my-20 h-8 w-8 animate-spin dark:stroke-white"
  />
  <template v-else>
    <div v-if="layout === 'tabs'">
      <div>
        <div class="flex flex-col gap-4">
          <TierTag
            v-for="tier in liveTiers"
            :key="tier.id"
            :tier="tier"
            :isActive="selectedTierTag === tier.tag"
          />
        </div>
      </div>
      <div class="my-4 flex flex-col items-center" v-if="!isTierListFetching">
        <Button v-if="!isCurrentTier" @click="handleShowPayment" class="mt-4">
          <Loader2 v-if="isSubscribeFetching" class="h-4 w-4 animate-spin stroke-white" />
          {{ t('signUp.confirmMembership') }}
        </Button>
        <Button
          v-if="!isCurrentTier"
          variant="ghost"
          size="sm"
          @click="handleSkipForNow"
          class="mt-2 text-sm text-black dark:text-white"
        >
          {{ t('signUp.skipForNow') }}
        </Button>
      </div>
    </div>
    <div v-else-if="layout === 'cards'" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MembershipCard
        v-for="tier in liveTiers"
        class="mx-auto"
        :key="tier.id"
        :tier="tier"
        @showPayment="handleShowPayment"
      />
    </div>
    <div
      v-if="activeTier"
      class="mx-auto mt-8 w-fit cursor-pointer text-sm underline underline-offset-2 dark:text-white"
      @click="openCancelSubscriptionDialog = true"
    >
      {{ t('membership.cancelSubscription') }}
    </div>
  </template>
  <Dialog :open="openCancelSubscriptionDialog" @update:open="openCancelSubscriptionDialog = false">
    <DialogContent class="bg-white p-8">
      <DialogHeader>
        <DialogTitle
          class="my-4 text-balance text-center font-Matter text-5xl font-light uppercase"
          >{{ t('membership.cancelSubscription') }}</DialogTitle
        >
        <DialogDescription
          class="text-balance text-center font-Matter text-base font-light lg:text-lg"
          >{{ t('membership.cancelSubscriptionDescription') }}</DialogDescription
        >
      </DialogHeader>
      <Button
        class="mt-4"
        :variant="isDarkMode ? 'default' : 'secondary'"
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

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { useTierStore } from '@stores/tier.store';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@/composables/useFanTracking';
import { useAccountStore } from '@stores/account.store';
import { storeToRefs } from 'pinia';

import { Loader2 } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import Button from '@ui/button/Button.vue';
import MembershipCard from '@modules/Memberships/MembershipCard.vue';
import TierTag from '@modules/Memberships/TierTag.vue';

withDefaults(
  defineProps<{
    layout?: 'tabs' | 'cards';
  }>(),
  {
    layout: 'tabs',
  },
);

const emit = defineEmits(['showPayment', 'skipForNow']);

const { t } = useTranslation();
const fanTracking = useFanTracking();
const tierStore = useTierStore();
const { isTierListFetching, liveTiers, selectedTier, activeTier } = storeToRefs(tierStore);
const fanStore = useFanStore();
const { isSubscribeFetching, isUnsubscribeFetching, unsubscribeData, unsubscribeError } =
  storeToRefs(fanStore);
const accountStore = useAccountStore();

const openCancelSubscriptionDialog = ref(false);
const isSubmitting = ref(false);

const selectedTierTag = computed(() => selectedTier.value?.tag);
const isCurrentTier = computed(() => activeTier.value?.id === selectedTier.value?.id);
const isDarkMode = computed(() => document.body.classList.contains('dark'));

const cancelSubscription = async () => {
  unsubscribeData.value = null;
  unsubscribeError.value = null;
  await fanStore.unsubscribe();

  if (unsubscribeError.value) {
    console.log('unsubscribeError', unsubscribeError.value);
    openCancelSubscriptionDialog.value = false;
    return;
  }

  openCancelSubscriptionDialog.value = false;
  fanTracking.trackMembershipCancellationRequested(
    selectedTierTag.value,
    fanStore.fanSubscriptionId,
  );
  tierStore.resetSelectedTier();
  accountStore.logoutFan('Home');
};

const handleShowPayment = async () => {
  window.scrollTo({ top: 0 });
  fanTracking.trackTierSelected(selectedTierTag.value);
  if (selectedTier.value?.price === 0) {
    isSubmitting.value = true;
    await fanStore.subscribe(selectedTier.value?.id);
    fanStore.fanGet();
    isSubmitting.value = false;
  } else {
    emit('showPayment');
  }
};

const handleSkipForNow = () => {
  emit('skipForNow');
};

onMounted(async () => {
  await tierStore.fetchTierList();
});
</script>
