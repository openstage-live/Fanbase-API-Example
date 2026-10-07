import { ApiOk, apiService, type ApiResult } from '@/api/api.service';
import { featureFlags } from '@/utils/feature.flags';
import { useArtistStore } from '@/stores/artist.store';
import { z } from 'zod';

export type TelemetryItem = z.infer<typeof TelemetryItem>;
export type TelemetryList = z.infer<typeof TelemetryList>;
type PostTelemetryData = z.infer<typeof PostTelemetryData>;

const TelemetryItem = z.object({
  createdAt: z.iso.datetime(),
  metric: z.string(),
  resource: z.string(),
  resourceId: z.string(),
});

const TelemetryList = TelemetryItem.array();

const PostTelemetryData = z.object({
  metric: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
});

export async function getTelemetry(signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/telemetry`,
      params: { artistId: useArtistStore().id },
    },
    TelemetryList,
    { signal, requiresAuth: true },
  );
}

export async function postTelemetry(
  data: PostTelemetryData,
  signal?: AbortSignal,
): Promise<ApiResult<ApiOk>> {
  if (!featureFlags.telemetry) {
    if (import.meta.env.DEV) {
      console.info('Telemetry is currently disabled', data);
    }

    return { success: false, message: 'Telemetry is currently disabled' };
  }

  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFanQueue}/telemetry`,
      data: { ...data, artistId: useArtistStore().id },
    },
    ApiOk,
    { signal, requiresAuth: true },
  );
}
