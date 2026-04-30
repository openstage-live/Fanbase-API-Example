import { apiService } from '@/api/api.service';
import { useAccountStore } from '@/stores/account.store';
import { z } from 'zod';

// Schemas

export const PostCollection = z.object({
  id: z.uuid(),
  artistId: z.uuid(),
  name: z.string(),
  createdAt: z.iso.datetime(),
});

export const PostCollectionList = PostCollection.array();

// Types

export type PostCollection = z.infer<typeof PostCollection>;
export type PostCollectionList = z.infer<typeof PostCollectionList>;

// Payloads

type PostCollectionPayload = {
  artistId: string;
};

export async function getPostCollectionList(params: PostCollectionPayload, signal?: AbortSignal) {
  const authToken = useAccountStore().authToken;
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/post-collection`,
      params,
      headers,
    },
    PostCollectionList,
    { signal },
  );
}
