<template>
  <div class="!pt-0">
    <div class="mx-auto">
      <div class="container">
        <div class="relative flex pb-12 pt-28">
          <div v-if="!fanId && isFanFetching" class="flex w-full items-center justify-center">
            <Loader2 color="white" class="h-8 w-8 animate-spin" />
          </div>
          <div v-else class="w-full">
            <div class="flex items-center gap-x-4">
              <h1 class="font-Matter text-3xl text-white">
                {{ hiFanName }}
              </h1>
              <Avatar size="sm">
                <AvatarImage v-if="fanAvatarUrl" :src="fanAvatarUrl" alt="Fan avatar" />
                <div
                  v-else
                  class="absolute flex h-10 w-10 items-center justify-center rounded-full bg-white"
                >
                  <UserRound color="black" />
                </div>
              </Avatar>
            </div>
            <div class="mt-8 flex flex-row justify-between align-baseline">
              <div class="flex flex-col gap-y-2">
                <div
                  v-for="stat in profileStatsFiltered"
                  :key="stat.key"
                  class="flex items-center gap-x-2 text-balance font-Matter text-4xl font-light uppercase lg:text-5xl"
                >
                  <span class="font-Matter font-semibold leading-none text-white">
                    {{ stat.value }}
                  </span>
                  <span class="font-Matter font-semibold text-white/40">
                    {{ t(`profile.${stat.translationKey}`) }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col justify-end">
                <InviteButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="timeline-wrapper relative min-h-dvh overflow-hidden pb-8 pt-8">
        <div class="container">
          <Timeline />
        </div>
      </div>
      <div class="relative bg-white">
        <div v-if="timelineStore.isFetching" class="container">
          <LoadingSection />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarImage } from '@ui/avatar';
import { Loader2, UserRound } from 'lucide-vue-next';
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useFanStore } from '@stores/fan.store';
import { useTimelineStore } from '@stores/timeline.store';
import { useTranslation } from '@/locales/i18n';
import InviteButton from '@generics/Buttons/InviteButton.vue';
import LoadingSection from '@generics/LoadingSection.vue';
import Timeline from '@modules/Timeline/Timeline.vue';

definePage({
  name: 'Timeline',
  meta: {
    requiresAuth: true,
    bgColor: 'black',
  },
});

// Composables
const { t } = useTranslation();
const fanStore = useFanStore();
const { fanData, fanId, fanPatchData, fanPatchError, isFanFetching, fanAvatarUrl } =
  storeToRefs(fanStore);

const timelineStore = useTimelineStore();
const { profileStatsFiltered } = storeToRefs(timelineStore);

// Refs
const isDropdownOpen = ref(false);
const tabOptions = ref(['personal-information', 'membership', 'card-details']);

const getHashTab = () => {
  const hash = window.location.hash.replace('#', '');
  return tabOptions.value.includes(hash) ? hash : 'timeline';
};

const activeTab = ref(getHashTab());

// Computed
const hiFanName = computed(() => t('profile.hi', { fanName: fanData.value?.firstName }));

// Watchers
watch(activeTab, (val) => {
  window.location.hash = val;
  isDropdownOpen.value = false;
});

onMounted(() => {
  fanPatchData.value = null;
  fanPatchError.value = null;
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (tabOptions.value.includes(hash)) {
      activeTab.value = hash;
    }
  });

  timelineStore.init();
});
</script>
