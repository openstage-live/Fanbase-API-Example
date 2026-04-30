import { apiService } from '@/api/api.service';
import { z } from 'zod';

export const TierPeriod = z.enum(['month', 'year']);
export const TierStatus = z.enum(['live', 'draft']);

export const TierItem = z.object({
  pushNotifications: z.boolean(),
  period: TierPeriod,
  joiningFee: z.number(),
  createdAt: z.iso.datetime(),
  description: z.string(),
  artistId: z.uuid(),
  trialDays: z.number(),
  price: z.number(),
  name: z.string(),
  emailNotifications: z.boolean(),
  id: z.uuid(),
  tag: z.string(),
  messagingNotifications: z.boolean(),
  smsNotifications: z.boolean(),
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
