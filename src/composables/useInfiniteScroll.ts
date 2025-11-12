import { ref, computed } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

export function useInfiniteScroll<T>(items: () => T[], initialCount = 5, increment = 5) {
  const displayedCount = ref(initialCount);
  const isLoading = ref(false);
  const triggerElement = ref<HTMLElement>();

  const displayedItems = computed(() => {
    return items().slice(0, displayedCount.value);
  });

  const hasMore = computed(() => {
    return displayedCount.value < items().length;
  });

  const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return;

    isLoading.value = true;
    displayedCount.value += increment;
    isLoading.value = false;
  };

  const reset = () => {
    displayedCount.value = initialCount;
  };

  // Set up intersection observer
  useIntersectionObserver(
    triggerElement,
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isLoading.value) {
        loadMore();
      }
    },
    { threshold: 0.1 },
  );

  return {
    displayedItems,
    displayedCount,
    hasMore,
    isLoading,
    triggerElement,
    loadMore,
    reset,
  };
}
