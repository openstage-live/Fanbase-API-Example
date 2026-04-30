import { computed, ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { getTierList, TierItem, TierList } from '@api/tier.api';
import { useApiFetcher } from '@composables/useApiFetcher';
import { useArtistStore } from './artist.store';
import { useFanStore } from '@stores/fan.store';

export const useTierStore = defineStore('tier', () => {
  const fanStore = useFanStore();
  const { fanSubscriptionId } = storeToRefs(fanStore);

  const {
    data: tierList,
    error: tierListError,
    isFetching: isTierListFetching,
    execute: executeTierListFetch,
    reset: resetTierList,
    cancel: cancelRequests,
  } = useApiFetcher<TierList>([]);

  const selectedTierRef = ref<TierItem | null>(null);

  const liveTiers = computed(() =>
    tierList.value.filter((tier: TierItem) => tier.status === 'live').reverse(),
  );

  const selectedTier = computed(
    () => selectedTierRef.value || (liveTiers.value.length ? liveTiers.value[0] : null),
  );

  const activeTier = computed(() =>
    liveTiers.value?.find((tier: TierItem) => tier.id === fanSubscriptionId?.value),
  );

  const hasLiveTiers = computed((): boolean => {
    return liveTiers.value.length > 0;
  });

  const isHighestTier = computed((): boolean => {
    if (!activeTier.value) return false;
    const highestPrice = Math.max(...(liveTiers.value?.map((tier: TierItem) => tier.price) || [0]));
    return activeTier.value.price === highestPrice;
  });

  const fetchTierList = async () => {
    await executeTierListFetch((signal) => getTierList({ artistId: useArtistStore().id }, signal));
  };

  const setSelectedTier = (tier: TierItem) => {
    selectedTierRef.value = tier;
  };

  const resetSelectedTier = () => {
    selectedTierRef.value = null;
  };

  return {
    tierList,
    tierListError,
    isTierListFetching,
    fetchTierList,
    resetTierList,

    liveTiers,
    activeTier,
    selectedTier,
    hasLiveTiers,
    isHighestTier,
    setSelectedTier,

    resetSelectedTier,
    cancelRequests,
  };
});
