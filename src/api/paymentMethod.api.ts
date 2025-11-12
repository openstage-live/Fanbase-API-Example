import { ApiOk, apiService } from '@/api/api.service';
import { useArtistStore } from '@/stores/artist.store';
import { z } from 'zod';

// Schemas
export const PaymentMethod = z.object({
  brand: z.string(),
  defaultPaymentMethod: z.boolean(),
  expiresMonth: z.number(),
  expiresYear: z.number(),
  id: z.string(),
  last4digits: z.string(),
});

export const PaymentMethodList = PaymentMethod.array();

export const PaymentMethodSetupIntent = z.object({
  clientSecret: z.string(),
});

// Types
export type PaymentMethod = z.infer<typeof PaymentMethod>;
export type PaymentMethodList = z.infer<typeof PaymentMethodList>;
export type PaymentMethodSetupIntent = z.infer<typeof PaymentMethodSetupIntent>;

export async function getPaymentMethodList(signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/fan/payment-method`,
      params: {
        artistId: useArtistStore().id,
      },
    },
    PaymentMethodList,
    { signal, requiresAuth: true },
  );
}

export async function createSetupIntent(signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/payment-method`,
      data: {
        artistId: useArtistStore().id,
      },
    },
    PaymentMethodSetupIntent,
    { signal, requiresAuth: true },
  );
}

export async function updatePaymentMethod(id: string, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'PATCH',
      url: `${apiService.openstageApiFan}/fan/payment-method`,
      data: {
        id,
        artistId: useArtistStore().id,
      },
    },
    PaymentMethodList,
    { signal, requiresAuth: true },
  );
}

export async function deletePaymentMethod(id: string, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'DELETE',
      url: `${apiService.openstageApiFan}/fan/payment-method`,
      params: {
        id,
        artistId: useArtistStore().id,
      },
    },
    ApiOk,
    { signal, requiresAuth: true },
  );
}
