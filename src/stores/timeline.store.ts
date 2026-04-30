import type { TelemetryItem } from '@/api/tracking.api';
import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useFanStore } from './fan.store';
import { useTelemetryStore } from './telemetry.store';
import { useTranslation } from '@/locales/i18n';
import { compareDesc, format, isBefore, parseISO } from 'date-fns';

export const TIMELINE_ITEM_TYPES = {
  MY_STORY: 'my-story',
  CHECK_INS: 'check-ins',
  DOWNLOAD: 'download',
  FRIENDS: 'friends',
} as const;

export type TimelineItemType = (typeof TIMELINE_ITEM_TYPES)[keyof typeof TIMELINE_ITEM_TYPES];

export interface ProfileStat {
  key: string;
  value: number;
  translationKey: 'checkIns' | 'dailies' | 'download' | 'invites';
}

export interface FilterType {
  type: TimelineItemType;
  label: string;
  color: string;
}

export interface TimelineItem {
  id: string;
  title?: string;
  description?: string;
  type: TimelineItemType;
  date: string; // ISO utc
  image?: {
    url: string;
    alt: string;
    size?: 'sm' | 'lg';
  };
  link?: {
    url: string;
    label?: string;
    isExternal?: boolean;
  };
}

interface TimelineMonth {
  period: string; // eg. 2025-06
  items: TimelineItem[];
}

interface TimelineYear {
  year: string; // eg. 2025
  months: TimelineMonth[];
}

export const useTimelineStore = defineStore('timeline', () => {
  const INITIAL_DISPLAY_COUNT = 10;

  const { t } = useTranslation();

  const fanStore = useFanStore();
  const { getCommentsData, getFriendsData, getLikesData, getTransactionsData } =
    storeToRefs(fanStore);

  const telemetryStore = useTelemetryStore();
  const { telemetryData } = storeToRefs(telemetryStore);

  const isFetching = ref(false);

  // Lazy loading state
  const displayedItemsCount = ref(INITIAL_DISPLAY_COUNT);
  const isLoadingMore = ref(false);

  const telemetryItems = computed(() => {
    const items: TimelineItem[] = [];

    // Group metrics by resourceId to handle duplicates, keeping earliest occurrence
    const metricMaps = {
      download: new Map<string, TelemetryItem>(),
      'view-post-video': new Map<string, TelemetryItem>(),
      'play-post-audio': new Map<string, TelemetryItem>(),
    };

    telemetryData.value.forEach((item) => {
      const metricMap = metricMaps[item.metric as keyof typeof metricMaps];
      if (!metricMap) return;

      const existing = metricMap.get(item.resourceId);
      if (!existing || isBefore(parseISO(item.createdAt), parseISO(existing.createdAt))) {
        metricMap.set(item.resourceId, item);
      }
    });

    telemetryData.value.forEach((item) => {
      let timelineItem: TimelineItem;

      switch (item.metric) {
        case 'subscribe':
          timelineItem = {
            id: crypto.randomUUID(),
            title: t(`timeline.subscriptions.default.title`),
            description: t(`timeline.subscriptions.default.description`),
            type: 'my-story',
            date: item.createdAt,
          };
          break;

        case 'upgrade':
          timelineItem = {
            id: crypto.randomUUID(),
            title: t('timeline.upgrade.title'),
            description: t('timeline.upgrade.description'),
            type: 'my-story',
            date: item.createdAt,
          };
          break;

        case 'subscribe-cancel':
          timelineItem = {
            id: crypto.randomUUID(),
            title: t('timeline.subscriptionCancellation.title'),
            description: t('timeline.subscriptionCancellation.description'),
            type: 'my-story',
            date: item.createdAt,
          };
          break;

        case 'nfc-tap':
          timelineItem = {
            id: crypto.randomUUID(),
            title: t(`timeline.nfcTaps.default.title`),
            description: t(`timeline.nfcTaps.default.description`),
            type: 'check-ins',
            date: item.createdAt,
          };
          break;

        case 'download':
          if (metricMaps.download.get(item.resourceId) !== item) return;

          timelineItem = {
            id: crypto.randomUUID(),
            title: item.resource,
            description: t('timeline.downloadedContent'),
            type: 'download',
            date: item.createdAt,
            link: {
              url: `/post/${item.resourceId}`,
              isExternal: false,
            },
          };
          break;

        default:
          // Skip unknown metrics
          return;
      }

      items.push(timelineItem);
    });

    return items;
  });

  const commentsItems = computed(() => {
    return getCommentsData.value
      .filter((comment) => comment.comment.trim() !== '') // Only include comments with content
      .map((comment): TimelineItem => {
        let description: string;

        if (comment.replyToId) {
          // Reply to comment
          if (comment.resource) {
            description = t('timeline.repliedToCommentFrom', {
              username: '@' + comment.resource,
            });
          } else {
            description = t('timeline.repliedToComment');
          }
        } else {
          // Comment on post
          if (comment.resource) {
            description = t('timeline.commentedOnPostTitle', {
              title: comment.resource,
            });
          } else {
            description = t('timeline.commentedOnPost');
          }
        }

        return {
          id: crypto.randomUUID(),
          description,
          type: 'my-story',
          date: comment.createdAt,
          link: {
            url: `/post/${comment.postId}`,
            isExternal: false,
          },
        };
      });
  });

  const friendsItems = computed(() => {
    return getFriendsData.value.map(
      (friend): TimelineItem => ({
        id: crypto.randomUUID(),
        description: t('timeline.connectedWithUser', {
          username: '@' + friend.name,
        }),
        type: 'friends',
        date: friend.createdAt,
      }),
    );
  });

  const likesItems = computed(() => {
    return getLikesData.value.map(
      (like): TimelineItem => ({
        id: crypto.randomUUID(),
        description: like.commentId
          ? like.resource
            ? t('timeline.likedCommentFrom', {
                username: '@' + like.resource,
              })
            : t('timeline.likedComment')
          : like.resource
            ? t('timeline.likedPostTitle', { title: like.resource })
            : t('timeline.likedPost'),
        type: 'my-story',
        date: like.createdAt,
        link: like.postId
          ? {
              url: `/post/${like.postId}`,
              isExternal: false,
            }
          : undefined,
      }),
    );
  });

  const transactionsItems = computed(() => {
    return getTransactionsData.value
      .filter((item) => item.type === 'ticketing' || item.type === 'merch')
      .map((item): TimelineItem => {
        const type = item.type as 'ticketing' | 'merch';

        return {
          id: crypto.randomUUID(),
          title: t(`timeline.transactions.${type}.title`),
          description: t(`timeline.transactions.${type}.description`, {
            description: item.description || '',
            volume: item.volume || 1,
          }),
          type: 'check-ins',
          date: item.transactionDate,
        };
      });
  });

  const items = computed<TimelineItem[]>(() => {
    return [
      ...telemetryItems.value,
      ...commentsItems.value,
      ...friendsItems.value,
      ...likesItems.value,
      ...transactionsItems.value,
    ];
  });

  const error = ref<Error | null>(null);

  const activeFilter = ref<TimelineItemType | null>(null);

  // Profile stats computed properties
  const checkInsCount = computed(() => {
    return items.value.filter((item) => item.type === 'check-ins').length;
  });

  const downloadCount = computed(() => {
    return items.value.filter((item) => item.type === 'download').length;
  });

  const friendsCount = computed(() => getFriendsData.value.length);

  const dailiesCount = computed(() => {
    return items.value.filter((item) => item.type === 'my-story').length;
  });

  const profileStats = computed((): ProfileStat[] => [
    { key: 'checkIns', value: checkInsCount.value, translationKey: 'checkIns' },
    { key: 'dailies', value: dailiesCount.value, translationKey: 'dailies' },
    { key: 'download', value: downloadCount.value, translationKey: 'download' },
    { key: 'friends', value: friendsCount.value, translationKey: 'invites' },
  ]);

  const profileStatsFiltered = computed((): ProfileStat[] =>
    profileStats.value.filter((stat) => stat.value > 0),
  );

  const filteredItems = computed(() => {
    if (activeFilter.value === null) {
      return items.value;
    }
    return items.value.filter((item) => item.type === activeFilter.value);
  });

  // Get flat list of all filtered timeline items sorted by date descending
  const allTimelineItems = computed(() => {
    return [...(filteredItems.value || [])].sort((a, b) =>
      compareDesc(parseISO(a.date), parseISO(b.date)),
    );
  });

  // Get displayed items based on current count
  const displayedItems = computed(() => {
    return allTimelineItems.value.slice(0, displayedItemsCount.value);
  });

  // Check if there are more items to load
  const hasMoreItems = computed(() => {
    return displayedItemsCount.value < allTimelineItems.value.length;
  });

  // Create year groups for displayed items only
  const itemsGroupedByYear = computed((): TimelineYear[] => {
    if (displayedItems.value.length === 0) return [];

    // Group displayed items by year first, then by month
    const yearGroups: Record<string, Record<string, TimelineItem[]>> = {};

    for (const item of displayedItems.value) {
      const year = format(parseISO(item.date), 'yyyy');
      const month = format(parseISO(item.date), 'yyyy-MM');

      if (!yearGroups[year]) {
        yearGroups[year] = {};
      }
      if (!yearGroups[year][month]) {
        yearGroups[year][month] = [];
      }
      yearGroups[year][month].push(item);
    }

    // Convert to TimelineYear[] and sort years descending
    return Object.entries(yearGroups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, monthGroups]) => ({
        year,
        months: Object.entries(monthGroups)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([period, items]) => ({
            period,
            items,
          })),
      }));
  });

  const fetch = async () => {
    isFetching.value = true;

    await Promise.all([
      fanStore.getComments(),
      fanStore.getFriends(),
      fanStore.getLikes(),
      fanStore.getTransactions(),
      telemetryStore.fetchTelemetry(),
    ]);

    isFetching.value = false;
  };

  const init = async () => {
    if (items.value.length === 0 && !isFetching.value) {
      await fetch();
    }
  };

  // Filter management functions
  const toggleFilter = (type: TimelineItemType) => {
    if (activeFilter.value === type) {
      activeFilter.value = null; // Deactivate if clicking the same filter
    } else {
      activeFilter.value = type; // Activate the clicked filter
    }
  };

  const isFilterActive = (type: TimelineItemType) => {
    return activeFilter.value === type;
  };

  // Load more items functionality
  const loadMoreItems = async () => {
    if (isLoadingMore.value || !hasMoreItems.value) return;
    isLoadingMore.value = true;
    displayedItemsCount.value += INITIAL_DISPLAY_COUNT;
    isLoadingMore.value = false;
  };

  // Reset displayed count when filter changes
  watch(
    filteredItems,
    () => {
      displayedItemsCount.value = INITIAL_DISPLAY_COUNT;
    },
    { immediate: true },
  );

  return {
    items,
    itemsGroupedByYear,
    isFetching,
    error,
    activeFilter,
    filteredItems,
    // Lazy loading
    displayedItems,
    displayedItemsCount,
    isLoadingMore,
    hasMoreItems,
    loadMoreItems,
    // Functions
    fetch,
    toggleFilter,
    isFilterActive,
    init,
    // Profile stats
    profileStats,
    profileStatsFiltered,
    checkInsCount,
    downloadCount,
    friendsCount,
    dailiesCount,
  };
});
