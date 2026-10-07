import type { ApiOk } from '@/api/api.service';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useAccountStore } from '@stores/account.store';
import {
  getFan as getFanApi,
  patchFan as patchFanApi,
  subscribeFan as subscribeFanApi,
  unsubscribeFan as unsubscribeFanApi,
  addFanAttribute as addFanAttributeApi,
  getFanAttributes as getFanAttributesApi,
  getFanTransactions as getFanTransactionsApi,
  createFriendLink as createFriendLinkApi,
  getFanFriends as getFanFriendsApi,
  getFanLikes as getFanLikesApi,
  getFanComments as getFanCommentsApi,
  type FanTransactionsResponse,
  type FanAttributesResponse,
  type FanFriendLinkResponse,
  type FanSubscribeResponse,
  type FanFriendsResponse,
  type FanLikesResponse,
  type FanCommentsResponse,
} from '@/api/fan.api';
import type {
  Fan,
  FanUpdateData,
  RequiredFields,
  FanAttributeData,
  FanFriendLinkData,
} from '@/api/fan.api';
import { useZatapStore } from './zatap.store';
import { useApiFetcher } from '@/composables/useApiFetcher';
import { useArtistStore } from '@/stores/artist.store';
import { useFanTracking } from '@/composables/useFanTracking';

export const useFanStore = defineStore('fan', () => {
  const accountStore = useAccountStore();
  const zatapStore = useZatapStore();
  const artistStore = useArtistStore();
  const { trackFanDetailsRefreshed } = useFanTracking();

  const subscriptionUpgradeInProgress = ref(false);

  // API Fetchers
  const {
    data: fanData,
    error: fanError,
    isFetching: isFanFetching,
    execute: executeFanGet,
    reset: resetFanGet,
  } = useApiFetcher<Fan | null>(null, {
    successCallback: (data) => {
      if (data) {
        accountStore.setSubscriptionId(data.subscriptionId);
        trackFanDetailsRefreshed(data.id, data.subscriptionId);
        zatapStore.recordTagTelemetry();
      }
    },
    errorCallback: () => {
      accountStore.logoutFan('Login');
    },
  });

  const {
    data: fanPatchData,
    error: fanPatchError,
    isFetching: isFanPatchFetching,
    execute: executeFanPatch,
    reset: resetFanPatch,
  } = useApiFetcher<Fan | null>(null);

  const {
    data: subscribeData,
    error: subscribeError,
    isFetching: isSubscribeFetching,
    execute: executeSubscribe,
  } = useApiFetcher<FanSubscribeResponse | null>(null);

  const {
    data: unsubscribeData,
    error: unsubscribeError,
    isFetching: isUnsubscribeFetching,
    execute: executeUnsubscribe,
  } = useApiFetcher<ApiOk | null>(null, {
    successCallback: () => {
      fanGet();
    },
  });

  const {
    data: attributeData,
    error: attributeError,
    isFetching: isAttributeFetching,
    execute: executeAttribute,
  } = useApiFetcher<ApiOk | null>(null);

  const {
    data: getAttributesData,
    error: getAttributesError,
    isFetching: isGetAttributesFetching,
    execute: executeGetAttributes,
  } = useApiFetcher<FanAttributesResponse | null>(null);

  const {
    data: getTransactionsData,
    error: getTransactionsError,
    isFetching: isGetTransactionsFetching,
    execute: executeGetTransactions,
  } = useApiFetcher<FanTransactionsResponse>([]);

  const {
    data: getFriendLinkData,
    error: getFriendLinkError,
    isFetching: isGetFriendLinkFetching,
    execute: executeGetFriendLink,
  } = useApiFetcher<FanFriendLinkResponse | null>(null);

  const {
    data: getFriendsData,
    error: getFriendsError,
    isFetching: isGetFriendsFetching,
    execute: executeGetFriends,
  } = useApiFetcher<FanFriendsResponse>([]);

  const {
    data: getLikesData,
    error: getLikesError,
    isFetching: isGetLikesFetching,
    execute: executeGetLikes,
  } = useApiFetcher<FanLikesResponse>([]);

  const {
    data: getCommentsData,
    error: getCommentsError,
    isFetching: isGetCommentsFetching,
    execute: executeGetComments,
  } = useApiFetcher<FanCommentsResponse>([]);

  const fanId = computed(() => fanData.value?.id);
  const fanEmail = computed(() => fanData.value?.email);
  const fanSubscriptionId = computed(() => fanData.value?.subscriptionId);
  const fanAvatarUrl = computed(() => fanData.value?.avatarUrl);
  const fanSubscibredAt = computed(() => fanData.value?.subscribedAt);
  const fanSubscriptionCancelledAt = computed(() => fanData.value?.subscriptionCancelledAt);
  const cancellationRequestedAndPending = computed(() => {
    return Boolean(fanSubscriptionCancelledAt.value && fanSubscriptionId.value);
  });

  const isAdmin = computed(() => (fanData.value?.role || '').toLowerCase().includes('admin'));

  const hasMissingFields = computed(() => {
    if (isFanFetching.value) return false;
    if (!fanData.value) return true;

    const requiredFields = getRequiredFields();
    return (
      (!fanData.value.firstName && requiredFields.firstName) ||
      (!fanData.value.lastName && requiredFields.lastName) ||
      (!fanData.value.email && requiredFields.email) ||
      (!fanData.value.location && requiredFields.location) ||
      (!fanData.value.phoneNumber && requiredFields.phoneNumber) ||
      (!fanData.value.birthDate && requiredFields.birthDate)
    );
  });

  const getRequiredFields = (requireConsent?: boolean): RequiredFields => {
    return {
      firstName: true,
      lastName: true,
      email: true,
      location: true,
      phoneNumber: true,
      birthDate: true,
      consentEmail: requireConsent,
      consentMessaging: requireConsent,
    };
  };

  const setFanGetFetcherData = (fanDataPayload: Fan) => {
    fanData.value = fanDataPayload;
  };

  const updateFanGetFetcherData = (fanDataPayload: Partial<Fan>) => {
    if (fanData.value) {
      fanData.value = { ...fanData.value, ...fanDataPayload };
    }
  };

  const fanGet = async () => {
    if (isFanFetching.value) {
      console.warn('fanGet already in progress, skipping duplicate call');
      return;
    }

    await executeFanGet((signal) => getFanApi({ artistId: artistStore.id }, undefined, signal));
  };

  const fanPatch = async (payload: FanUpdateData, token?: string) => {
    await executeFanPatch((signal) =>
      patchFanApi(
        { ...payload, artistId: artistStore.id },
        token || accountStore.authToken,
        signal,
      ),
    );
    if (fanPatchError.value || !fanPatchData.value) return;
    setFanGetFetcherData(fanPatchData.value);
    accountStore.setSubscriptionId(fanPatchData.value.subscriptionId);
  };

  const fanPatchAvatar = async (payload: FanUpdateData) => {
    await executeFanPatch((signal) =>
      patchFanApi({ ...payload, artistId: artistStore.id }, accountStore.authToken, signal),
    );
    if (fanPatchError.value) return;
    const avatarUrl = fanPatchData.value?.avatarUrl;
    updateFanGetFetcherData({ avatarUrl });
  };

  const subscribe = async (tierId: string) => {
    await executeSubscribe((signal) => subscribeFanApi({ tierId }, signal));
  };

  const unsubscribe = async () => {
    await executeUnsubscribe((signal) => unsubscribeFanApi({ artistId: artistStore.id }, signal));
  };

  const attribute = async (payload: FanAttributeData) => {
    await executeAttribute((signal) =>
      addFanAttributeApi({ ...payload, artistId: artistStore.id }, signal),
    );
  };

  const getAttributes = async () => {
    await executeGetAttributes((signal) => getFanAttributesApi(signal));
  };

  const getTransactions = async () => {
    await executeGetTransactions((signal) =>
      getFanTransactionsApi({ artistId: artistStore.id }, signal),
    );
  };

  const getFriendLink = async (payload: FanFriendLinkData) => {
    await executeGetFriendLink((signal) =>
      createFriendLinkApi({ ...payload, artistId: artistStore.id }, signal),
    );
  };

  const getFriends = async () => {
    await executeGetFriends((signal) => getFanFriendsApi({ artistId: artistStore.id }, signal));
  };

  const getLikes = async () => {
    await executeGetLikes((signal) => getFanLikesApi({ artistId: artistStore.id }, signal));
  };

  const getComments = async () => {
    await executeGetComments((signal) => getFanCommentsApi({ artistId: artistStore.id }, signal));
  };

  const clear = () => {
    resetFanGet();
    resetFanPatch();
  };

  watch(
    () => accountStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) fanGet();
    },
    { immediate: true },
  );

  return {
    fanId,
    fanEmail,
    fanAvatarUrl,
    fanSubscibredAt,
    fanSubscriptionId,
    fanSubscriptionCancelledAt,
    cancellationRequestedAndPending,
    hasMissingFields,
    subscriptionUpgradeInProgress,
    isAdmin,

    fanData,
    fanError,
    isFanFetching,
    fanGet,

    fanPatchData,
    fanPatchError,
    isFanPatchFetching,
    fanPatch,

    subscribeData,
    subscribeError,
    isSubscribeFetching,
    subscribe,

    unsubscribeData,
    unsubscribeError,
    isUnsubscribeFetching,
    unsubscribe,

    attributeData,
    attributeError,
    isAttributeFetching,
    attribute,

    getAttributesData,
    getAttributesError,
    isGetAttributesFetching,
    getAttributes,

    getTransactionsData,
    getTransactionsError,
    isGetTransactionsFetching,
    getTransactions,

    getFriendLinkData,
    getFriendLinkError,
    isGetFriendLinkFetching,
    getFriendLink,

    getFriendsData,
    getFriendsError,
    isGetFriendsFetching,
    getFriends,

    getLikesData,
    getLikesError,
    isGetLikesFetching,
    getLikes,

    getCommentsData,
    getCommentsError,
    isGetCommentsFetching,
    getComments,

    setFanGetFetcherData,
    fanPatchAvatar,
    clear,
    getRequiredFields,
  };
});
