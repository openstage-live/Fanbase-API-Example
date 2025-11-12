import { defineStore } from 'pinia';
import { useApiFetcher } from '@composables/useApiFetcher';
import { type PostCollectionList, getPostCollectionList } from '@api/postCollection.api';
import { useArtistStore } from './artist.store';

export const usePostCollectionStore = defineStore('postCollection', () => {
  // Fetching Post List
  const {
    data: postCollectionList,
    error: postCollectionListError,
    isFetching: isPostCollectionListFetching,
    execute: executePostCollectionListFetch,
    reset: resetPostCollectionList,
    cancel: cancelPostCollectionListRequests,
  } = useApiFetcher<PostCollectionList>([]);

  const fetchPostCollectionList = async () => {
    await executePostCollectionListFetch((signal) =>
      getPostCollectionList({ artistId: useArtistStore().id }, signal),
    );
  };

  return {
    postCollectionList,
    postCollectionListError,
    isPostCollectionListFetching,
    fetchPostCollectionList,
    resetPostCollectionList,
    cancelPostCollectionListRequests,
  };
});
