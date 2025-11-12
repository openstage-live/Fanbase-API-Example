<template>
  <div
    class="flex w-full flex-col rounded-2xl border border-black/20"
    :class="[
      !isCurrentTier && appearance === 'sm' ? 'bg-white' : 'bg-white',
      appearance === 'sm' ? 'max-w-full items-start p-4' : 'max-w-sm items-center px-4 py-8',
    ]"
  >
    <div
      v-if="appearance === 'sm'"
      class="mb-2 rounded-full px-4 py-2 font-Matter-Medium text-sm uppercase leading-none"
      :class="isCurrentTier ? 'bg-green text-black' : 'bg-black/15 text-black'"
    >
      {{ t(isCurrentTier ? 'membership.active' : 'membership.inactive') }}
    </div>
    <div class="flex flex-row items-center" :class="appearance === 'sm' ? 'mb-1' : 'mb-8'">
      <span
        class="font-bold uppercase tracking-wide"
        :class="appearance === 'sm' ? 'text-xl' : 'text-3xl'"
      >
        {{ tier.name }}
      </span>
    </div>
    <div class="flex w-full items-center justify-between gap-x-1">
      <div :class="appearance === 'sm' ? 'mb-0 text-base' : 'mb-6 font-Matter text-4xl'">
        {{ tierPrice }}
      </div>
      <div
        v-if="
          !cancellationRequestedAndPending &&
          !isCurrentTier &&
          !isHighestTier &&
          appearance === 'sm'
        "
        @click="selectTier"
        class="cursor-pointer"
      >
        <Button
          variant="default"
          size="sm"
          class="ml-4 !h-8"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          <Loader2 v-if="isSubmitting" class="h-8 w-8 animate-spin stroke-white" />
          {{ activeTier ? t('membership.upgrade') : t('membership.select') }}
        </Button>
      </div>
    </div>

    <div v-if="!cancellationRequestedAndPending && appearance !== 'sm'">
      <Button v-if="!isCurrentTier" class="my-4 w-full" @click="selectTier">
        {{ t('membership.selectTier') }}
      </Button>
      <div v-else class="current-tier">
        {{ t('membership.currentTier') }}
      </div>
    </div>
    <hr v-if="appearance !== 'sm'" class="mb-6 w-full border border-black/10" />
    <ul class="w-full text-left" v-if="appearance !== 'sm'">
      <div v-html="tier.description" />
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { TierItem } from '@/api/tier.api';
import { useTierStore } from '@stores/tier.store';
import { useFanStore } from '@stores/fan.store';
import { storeToRefs } from 'pinia';
import { useTranslation } from '@/locales/i18n';

import { Loader2 } from 'lucide-vue-next';
import Button from '@ui/button/Button.vue';

const props = defineProps<{
  tier: TierItem;
  appearance?: 'default' | 'sm';
}>();

const emit = defineEmits(['showPayment']);

const { t } = useTranslation();
const fanStore = useFanStore();
const tierStore = useTierStore();
const { activeTier, isHighestTier } = storeToRefs(tierStore);
const { cancellationRequestedAndPending } = storeToRefs(fanStore);

const isSubmitting = ref(false);

const isCurrentTier = computed(() => activeTier.value?.id === props.tier.id);
const tierPrice = computed(() => {
  if (props.tier.price === 0) {
    return t('membership.free');
  } else {
    return price.value;
  }
});

const period = computed(() => {
  return props.tier?.period === 'month' ? t('common.monthly') : t('common.yearly');
});

const price = computed(() => {
  return `£${props.tier.price}/${period.value}`;
});

const selectTier = async () => {
  tierStore.setSelectedTier(props.tier);
  if (props.tier.price === 0) {
    isSubmitting.value = true;
    await fanStore.subscribe(props.tier.id);
    fanStore.fanGet();
    isSubmitting.value = false;
  } else {
    emit('showPayment');
  }
};
</script>
