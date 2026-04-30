import { ApiOk, apiService, type ApiResult } from '@/api/api.service';
import { featureFlags } from '@/utils/feature.flags';
import { useArtistStore } from '@/stores/artist.store';
import { z } from 'zod';
import * as Sentry from '@sentry/vue';

export type TelemetryItem = z.infer<typeof TelemetryItem>;
export type TelemetryList = z.infer<typeof TelemetryList>;
type PostTelemetryData = z.infer<typeof PostTelemetryData>;
type PostClickedLinkData = z.infer<typeof PostClickedLinkData>;

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

const PostClickedLinkData = z.object({
  email: z.string().nullable(),
  link: z.string(),
  pageId: z.string(),
  phoneNumber: z.string().nullable(),
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

export async function postClickedLink(
  data: PostClickedLinkData,
  signal?: AbortSignal,
): Promise<ApiResult<ApiOk>> {
  const payload = {
    ...data,
    origin: window?.location?.href,
    type: 'click',
  };

  if (!featureFlags.telemetry) {
    if (import.meta.env.DEV) {
      console.info('Telemetry is currently disabled', payload);
    }

    return { success: false, message: 'Telemetry is currently disabled' };
  }

  if (!payload.pageId) {
    Sentry.addBreadcrumb({
      category: 'log',
      message: `Details: pageId: ${payload.pageId}, link: ${payload.link}, email: ${payload.email}, phoneNumber: ${payload.phoneNumber}`,
      level: 'info',
    });

    Sentry.captureException(`Telemetry issue: clickedLink - missing pageId`);

    return { success: false, message: 'No pageId found' };
  }

  if (!payload.link) {
    return { success: false, message: 'No link found' };
  }

  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFanQueue}/clickedLink`,
      data: payload,
    },
    ApiOk,
    { signal },
  );
}
