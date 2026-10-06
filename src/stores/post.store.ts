import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useArtistStore } from '@stores/artist.store';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@/composables/useFanTracking';
import { useApiFetcher } from '@composables/useApiFetcher';
import {
  type PostItem,
  type PostList,
  type PostLike,
  getPostList,
  getPostItem,
  doLikePost,
  doDeleteLikePost,
} from '@api/post.api';

export const usePostStore = defineStore('post', () => {
  const fanStore = useFanStore();
  const fanTracking = useFanTracking();
  const postId = ref('');

  // Fetching Post Item
  const {
    data: postData,
    error: postError,
    isFetching: isPostFetching,
    execute: executePostFetch,
    reset: resetPost,
    cancel: cancelPostRequests,
  } = useApiFetcher<PostItem | null>(null);

  const fetchPost = async (postId: string) => {
    await executePostFetch((signal) =>
      getPostItem({ id: postId, artistId: useArtistStore().id }, signal),
    );
  };

  // Fetching Post List
  const {
    data: postListData,
    error: postListError,
    isFetching: isPostListFetching,
    execute: executePostListFetch,
    reset: resetPostList,
    cancel: cancelPostListRequests,
  } = useApiFetcher<PostList>([]);

  const fetchPostList = async (postCollectionId?: string) => {
    await executePostListFetch((signal) =>
      getPostList({ artistId: useArtistStore().id, postCollectionId }, signal),
    );
  };

  // Liking a Post
  const {
    data: postLikeData,
    error: postLikeError,
    isFetching: isPostLikeFetching,
    execute: executePostLikeFetch,
    reset: resetPostLike,
    cancel: cancelPostLikeRequests,
  } = useApiFetcher<PostLike | null>(null);

  const likePost = async (postId: string) => {
    const result = await executePostLikeFetch((signal) => doLikePost({ postId: postId }, signal));

    if (result.success) {
      fanTracking.trackPostLiked({ post_id: postId, fan_id: fanStore.fanId });
    }
  };

  // Deleting a like from a post
  const {
    data: postDeleteLikeData,
    error: postDeleteLikeError,
    isFetching: isPostDeleteLikeFetching,
    execute: executePostDeleteLikeFetch,
    reset: resetPostDeleteLike,
    cancel: cancelPostDeleteLikeRequests,
  } = useApiFetcher<PostLike | null>(null);

  const deleteLikePost = async (postId: string) => {
    const result = await executePostDeleteLikeFetch((signal) =>
      doDeleteLikePost({ postId: postId }, signal),
    );

    if (result.success) {
      fanTracking.trackPostUnliked({ post_id: postId, fan_id: fanStore.fanId });
    }
  };

  // Computed Properties
  const postList = computed(() => {
    const filteredPosts =
      postListData.value?.filter((post: PostItem) => {
        return !post.hideFromFeed && (post.accessGranted !== false || post.access === 'gated');
      }) ?? [];

    return filteredPosts.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  });

  return {
    postId,

    post: postData,
    postError,
    isPostFetching,
    fetchPost,
    resetPost,
    cancelPostRequests,

    postList,
    postListError,
    isPostListFetching,
    fetchPostList,
    resetPostList,
    cancelPostListRequests,

    postLikeData,
    postLikeError,
    isPostLikeFetching,
    likePost,
    resetPostLike,
    cancelPostLikeRequests,

    postDeleteLikeData,
    postDeleteLikeError,
    isPostDeleteLikeFetching,
    deleteLikePost,
    resetPostDeleteLike,
    cancelPostDeleteLikeRequests,
  };
});
