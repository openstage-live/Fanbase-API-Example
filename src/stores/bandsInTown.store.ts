import { computed } from 'vue';
import { defineStore } from 'pinia';
import {
  type BandsInTownEventList,
  type BandsInTownArtistItem,
  BandsInTownDate,
  getBandsInTownEvents,
  getBandsInTownArtist,
} from '@/api/bandsInTown';
import { useApiFetcher } from '@/composables/useApiFetcher';
import { useArtistStore } from '@/stores/artist.store';
import { env } from '@/env';

export const useBandsInTownStore = defineStore('bandsInTown', () => {
  const artistStore = useArtistStore();
  const bandsInTownArtistId = computed(() => artistStore.bandsInTownArtistId);

  const {
    data: artist,
    error: artistError,
    isFetching: isLoadingArtist,
    execute: executeGetArtist,
    reset: resetArtist,
    cancel: cancelArtist,
  } = useApiFetcher<BandsInTownArtistItem | null>(null);

  const {
    data: events,
    error: eventsError,
    isFetching: isLoadingEvents,
    execute: executeGetEvents,
    reset: resetEvents,
    cancel: cancelEvents,
  } = useApiFetcher<BandsInTownEventList>([]);

  const refreshArtist = async () => {
    if (!bandsInTownArtistId.value) {
      artistError.value = 'BandsInTown artist ID is not set';
      return;
    }
    if (!env.VITE_BANDSINTOWN_API_KEY) {
      artistError.value = 'BandsInTown API key is not set';
      return;
    }

    await executeGetArtist((signal) =>
      getBandsInTownArtist(
        {
          bandsInTownArtistId: bandsInTownArtistId.value!,
        },
        signal,
      ),
    );
  };

  const refreshEvents = async (date: BandsInTownDate = 'upcoming') => {
    if (!bandsInTownArtistId.value) {
      eventsError.value = 'BandsInTown artist ID is not set';
      return;
    }
    if (!env.VITE_BANDSINTOWN_API_KEY) {
      eventsError.value = 'BandsInTown API key is not set';
      return;
    }

    await executeGetEvents((signal) =>
      getBandsInTownEvents(
        {
          bandsInTownArtistId: bandsInTownArtistId.value!,
          date,
        },
        signal,
      ),
    );
  };

  return {
    artist,
    isLoadingArtist,
    artistError,
    refreshArtist,
    cancelArtist,
    resetArtist,
    events,
    isLoadingEvents,
    eventsError,
    refreshEvents,
    cancelEvents,
    resetEvents,
  };
});
