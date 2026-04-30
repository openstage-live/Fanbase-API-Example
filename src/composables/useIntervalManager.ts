import { ref, onUnmounted, getCurrentInstance } from 'vue';

interface IntervalInfo {
  id: number;
  callback: () => void;
  delay: number;
  component: string;
}

const useIntervalManager = () => {
  const intervals = ref<IntervalInfo[]>([]);
  const isPaused = ref(false);

  const addInterval = (callback: () => void, delay: number, component: string = 'unknown') => {
    if (isPaused.value) {
      const intervalInfo: IntervalInfo = {
        id: 0,
        callback,
        delay,
        component,
      };
      intervals.value.push(intervalInfo);
      return 0;
    }

    const id = setInterval(callback, delay);
    const intervalInfo: IntervalInfo = {
      id,
      callback,
      delay,
      component,
    };
    intervals.value.push(intervalInfo);
    return id;
  };

  const removeInterval = (id: number) => {
    clearInterval(id);
    intervals.value = intervals.value.filter((interval) => interval.id !== id);
  };

  const pauseAllIntervals = () => {
    isPaused.value = true;
    intervals.value.forEach((interval) => {
      clearInterval(interval.id);
    });
  };

  const resumeAllIntervals = () => {
    isPaused.value = false;
    intervals.value.forEach((interval) => {
      interval.id = setInterval(interval.callback, interval.delay);
    });
  };

  const clearAllIntervals = () => {
    intervals.value.forEach((interval) => {
      clearInterval(interval.id);
    });
    intervals.value = [];
  };

  // Only register onUnmounted if we're in a component context
  const instance = getCurrentInstance();
  if (instance) {
    onUnmounted(() => {
      clearAllIntervals();
    });
  }

  return {
    addInterval,
    removeInterval,
    pauseAllIntervals,
    resumeAllIntervals,
    clearAllIntervals,
    isPaused,
    intervals,
  };
};

// Global instance
export const globalIntervalManager = useIntervalManager();
