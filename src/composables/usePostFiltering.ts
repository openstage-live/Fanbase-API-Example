import { ref, computed } from 'vue';
import type { PostItem } from '@/api/post.api';

export function usePostFiltering(
  postList: () => PostItem[] | null,
  postCollectionList: () => Array<{ id: string }>,
) {
  const activeFilterId = ref<string | null>(null);

  const postCollectionIds = computed(
    () => new Set(postCollectionList().map((filter) => filter.id)),
  );

  const filteredPosts = computed(() => {
    if (!postList()) return [];

    return postList()!.filter((post: PostItem) => {
      if (!activeFilterId.value) {
        return !post.postCollectionId || postCollectionIds.value.has(post.postCollectionId);
      }

      return post.postCollectionId === activeFilterId.value;
    });
  });

  const setFilter = (filterId: string) => {
    activeFilterId.value = activeFilterId.value === filterId ? null : filterId;
  };

  const applyFilterFromQuery = (postCollectionId: string) => {
    if (postCollectionId && postCollectionIds.value.has(postCollectionId)) {
      activeFilterId.value = postCollectionId;
    }
  };

  return {
    activeFilterId,
    filteredPosts,
    setFilter,
    applyFilterFromQuery,
  };
}
