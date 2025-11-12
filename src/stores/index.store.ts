import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useIndexStore = defineStore('index', () => {
  const isButtonNearFooter = ref(false);
  const isPostVideoBlockVisible = ref(false);
  const scrollPosition = ref(0);
  const lastScrollPosition = ref(0);

  const checkScrollPosition = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const isNearBottom = scrollY + windowHeight >= documentHeight - 200;
    isButtonNearFooter.value = isNearBottom;
  };

  const updateScrollPosition = (scrollTop: number) => {
    // Preserve previous position for direction detection
    lastScrollPosition.value = scrollPosition.value;
    scrollPosition.value = scrollTop;
  };

  const initScrollListener = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', checkScrollPosition, { passive: true });
    }
  };

  const cleanupScrollListener = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', checkScrollPosition);
    }
  };

  return {
    isButtonNearFooter,
    isPostVideoBlockVisible,
    scrollPosition,
    lastScrollPosition,
    checkScrollPosition,
    updateScrollPosition,
    initScrollListener,
    cleanupScrollListener,
  };
});
