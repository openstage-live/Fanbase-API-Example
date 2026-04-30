import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { postTelemetry } from '@/api/tracking.api';
import { useAccountStore } from './account.store';

import { useApiFetcher } from '@/composables/useApiFetcher';
import { getZatapTag, type ProcessedZatapTagData } from '@/api/zatap.api';

export const useZatapStore = defineStore('zatap', () => {
  const router = useRouter();
  const accountStore = useAccountStore();

  const {
    data: tagData,
    error: tagError,
    isFetching: isTagFetching,
    execute: executeTagFetch,
    reset: resetTagData,
  } = useApiFetcher<ProcessedZatapTagData | null>(null);

  const tagVerified = computed(() => !!tagData.value);

  const processedTagData = useStorage(
    'processedTagData',
    [] as ProcessedZatapTagData[],
    localStorage,
    {
      serializer: {
        read: (value: string) => {
          try {
            const parsed = JSON.parse(value);
            // Handle migration from old string format to new array format
            if (typeof parsed === 'string') {
              // Old format was a JSON string, try to parse it as a single item
              try {
                const oldData = JSON.parse(parsed);
                return Array.isArray(oldData) ? oldData : [oldData];
              } catch {
                return [];
              }
            }
            // Ensure we always return an array
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        },
        write: (value: ProcessedZatapTagData[]) => JSON.stringify(value),
      },
    },
  );

  // Ensure the value is always an array
  if (!Array.isArray(processedTagData.value)) {
    processedTagData.value = [];
  }

  const fetchTag = async (tag: string) => {
    await executeTagFetch((signal) => getZatapTag({ tag: tag }, signal));
  };

  const storeTagDataInLC = (tagData: ProcessedZatapTagData) => {
    // Check if tag data already exists to avoid duplicates
    const existingIndex = processedTagData.value.findIndex(
      (item) => item.id === tagData.id && item.name === tagData.name,
    );

    if (existingIndex === -1) {
      processedTagData.value.push(tagData);
    } else {
      // Update existing item
      processedTagData.value[existingIndex] = tagData;
    }
  };

  const removeTagData = (tagData: ProcessedZatapTagData) => {
    const index = processedTagData.value.findIndex(
      (item) => item.id === tagData.id && item.name === tagData.name,
    );
    if (index > -1) {
      processedTagData.value.splice(index, 1);
    }
  };

  const recordTagTelemetry = async () => {
    if (!accountStore.isAuthenticated) return;
    processedTagData.value.forEach(async (tag) => {
      await postTelemetry({
        metric: 'nfc-tap',
        resource: tag.name,
      });
      removeTagData(tag);
    });
  };

  const handleTagData = async (newData: ProcessedZatapTagData) => {
    storeTagDataInLC(newData);
    // NOTE: telemetry recording happens automatically when user becomes authenticated via auth store watcher
    router.push({ name: 'Timeline' }).catch(console.error); // interrupts with login page
  };

  watch(tagData, (newData) => {
    if (newData) handleTagData(newData);
  });

  return {
    tagData,
    tagError,
    isTagFetching,
    tagVerified,
    fetchTag,
    processedTagData,
    recordTagTelemetry,
    storeTagDataInLC,
    removeTagData,
    resetTagData,
  };
});
