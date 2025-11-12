import { defineStore } from 'pinia';
import { getTelemetry, type TelemetryList } from '@/api/tracking.api';
import { useApiFetcher } from '@/composables/useApiFetcher';

export const useTelemetryStore = defineStore('telemetry', () => {
  const {
    data: telemetryData,
    error: telemetryError,
    isFetching: isFetchingTelemetry,
    execute: executeTelemetry,
    reset: resetTelemetry,
    cancel: cancelTelemetry,
  } = useApiFetcher<TelemetryList>([]);

  const fetchTelemetry = async () => {
    await executeTelemetry((signal) => getTelemetry(signal));
  };

  return {
    telemetryData,
    telemetryError,
    isFetchingTelemetry,
    fetchTelemetry,
    resetTelemetry,
    cancelTelemetry,
  };
});
