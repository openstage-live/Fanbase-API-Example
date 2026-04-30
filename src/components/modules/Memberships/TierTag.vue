<template>
  <div
    class="flex w-full cursor-pointer flex-row justify-between rounded-3xl border border-transparent p-4 transition-opacity duration-300 hover:opacity-100 dark:border dark:border-white"
    :class="isActive ? 'bg-black' : 'bg-tab-inactive opacity-50'"
    @click="tierStore.setSelectedTier(tier)"
  >
    <div class="flex flex-col items-start gap-2">
      <span class="font-Matter text-2xl" :class="{ 'text-white': isActive }">
        {{ tier?.name }}
      </span>
    </div>
    <div class="flex flex-col items-end gap-3">
      <span class="font-Matter-Medium text-4xl" :class="{ 'text-white': isActive }">
        {{ tier?.price === 0 ? t('membership.free') : `£${tier?.price}` }}
      </span>
      <div class="flex flex-row gap-2">
        <span
          class="w-fit rounded-full px-2 font-Matter-Medium text-xs uppercase"
          :class="isActive ? 'bg-gray-600 text-white' : 'bg-white'"
        >
          {{ period }}
        </span>
        <span
          v-if="activeTier?.id === tier?.id"
          class="bg-green-400 rounded-full px-2 text-xs font-bold uppercase text-black"
        >
          {{ t('membership.currentTier') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { useTierStore } from '@stores/tier.store';
import type { TierItem } from '@/api/tier.api';
import { storeToRefs } from 'pinia';

const { t } = useTranslation();

const tierStore = useTierStore();
const { activeTier } = storeToRefs(tierStore);

const period = computed(() => {
  return props.tier?.period === 'month' ? t('common.monthly') : t('common.yearly');
});

const props = defineProps<{
  tier: TierItem;
  isActive: boolean;
}>();
</script>
