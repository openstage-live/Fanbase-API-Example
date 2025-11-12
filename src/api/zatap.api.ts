import { z } from 'zod';
import { apiService } from '@/api/api.service';
import type { ApiResult } from '@/api/api.service';

const ZatapTagDataSchema = z.object({
  _embedded: z.object({
    'cid:model': z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
        }),
      )
      .optional(),
  }),
});

export interface ProcessedZatapTagData {
  id: number;
  name: string;
}

type ZatapTagParams = {
  tag: string;
};

export async function getZatapTag(
  params: ZatapTagParams,
  signal?: AbortSignal,
): Promise<ApiResult<ProcessedZatapTagData>> {
  if (!params.tag) {
    return { success: false, message: 'Tag is required' };
  }

  const endpoint = 'https://api.collectid.io/v2/tag/';
  const url = `${endpoint}${encodeURIComponent(params.tag)}?embed=cid:product,cid:model`;

  const result = await apiService.request(
    {
      method: 'GET',
      url,
      headers: {
        Accept: 'application/hal+json, application/json',
        'Content-Type': 'application/json',
      },
    },
    ZatapTagDataSchema,
    { signal },
  );

  if (!result.success) return { success: false, message: result.message };

  const model = result.data?._embedded?.['cid:model']?.[0];
  if (!model) return { success: false, message: 'failed to get tag' };

  return {
    success: true,
    data: {
      id: model.id,
      name: model.name,
    },
  };
}
