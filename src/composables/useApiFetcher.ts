import type { ApiResult } from '@/api/api.service';
import { ref, onUnmounted } from 'vue';

interface UseApiFetcherOptions<T> {
  autoAbort?: boolean;
  successCallback?: (data: T) => void;
  errorCallback?: (error: string) => void;
}

export function useApiFetcher<T>(
  defaultValue: T,
  options: UseApiFetcherOptions<T> = { autoAbort: true },
) {
  // Options
  const { autoAbort, successCallback, errorCallback } = options;

  // Reactive state
  const data = ref<T>(defaultValue);
  const error = ref<string | null>(null);
  const isFetching = ref(false);

  // Abort controller management
  let abortController: AbortController | null = null;

  /**
   * Check if a request is currently active
   */
  const isActive = () => abortController && !abortController.signal.aborted;

  /**
   * Cancel the current request if any
   */
  const cancel = () => {
    abortController?.abort();
    abortController = null;
    isFetching.value = false;
  };

  /**
   * Reset all state to initial values
   */
  const reset = () => {
    cancel();
    data.value = defaultValue;
    error.value = null;
    isFetching.value = false;
  };

  /**
   * Execute an API method with abort controller management
   */
  const execute = async (apiMethod: (signal: AbortSignal) => Promise<ApiResult<T>>) => {
    // Auto-abort previous request if enabled
    if (autoAbort && isActive()) {
      cancel();
    }

    // Create new abort controller
    abortController = new AbortController();
    const currentController = abortController;

    // Reset error state and set fetching
    error.value = null;
    isFetching.value = true;

    // Execute the API method
    const result = await apiMethod(currentController.signal);

    // Only update state if this controller is still the active one
    if (currentController !== abortController) {
      return result;
    }

    // Handle result
    if (result.success) {
      data.value = result.data;
      error.value = null;
      successCallback?.(result.data);
    } else {
      data.value = defaultValue;
      error.value = result.message;
      errorCallback?.(result.message);
    }

    isFetching.value = false;
    abortController = null;

    return result;
  };

  // Cleanup on unmount
  onUnmounted(() => {
    cancel();
  });

  return {
    data,
    error,
    isFetching,
    execute,
    reset,
    cancel,
    isActive,
  };
}
