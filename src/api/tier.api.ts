import { apiService } from '@/api/api.service';
import { z } from 'zod';

export const TierPeriod = z.enum(['month', 'year']);
export const TierStatus = z.enum(['live', 'draft']);

export const TierItem = z.object({
  push_notifications: z.boolean(),
  period: TierPeriod,
  joining_fee: z.number(),
  created_at: z.iso.datetime(),
  description: z.string(),
  artist_id: z.uuid(),
  trial_days: z.number(),
  price: z.number(),
  name: z.string(),
  email_notifications: z.boolean(),
  id: z.uuid(),
  tag: z.string(),
  messaging_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  status: TierStatus,
});

export const TierList = TierItem.array();

export type TierPeriod = z.infer<typeof TierPeriod>;
export type TierStatus = z.infer<typeof TierStatus>;
export type TierItem = z.infer<typeof TierItem>;
export type TierList = z.infer<typeof TierList>;

type TierListPayload = {
  artistId: string;
};

export async function getTierList(params: TierListPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/tier`,
      params,
    },
    TierList,
    { signal, requiresAuth: true },
  );
}
