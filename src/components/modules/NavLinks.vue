<template>
  <div class="flex h-full flex-col justify-between gap-y-8">
    <div class="grid gap-y-1">
      <template v-for="(item, index) in availableNavItems" :key="item.id">
        <span v-if="item.name" :class="animationClasses" :style="getTransitionDelay(index).value">
          <RouterLink
            class="link-xl text-white transition-all ease-out"
            active-class="text-white/70"
            :to="{ name: item.name }"
            @click="handleNavLinkClick(item)"
          >
            {{ item.label }}
          </RouterLink>
        </span>
        <span
          v-else-if="item.action"
          class="link-xl cursor-pointer text-white transition-all ease-out hover:text-white/70"
          :class="animationClasses"
          :style="getTransitionDelay(index).value"
          @click="handleNavLinkClick(item)"
        >
          {{ item.label }}
        </span>
      </template>
    </div>
    <div>
      <div class="grid gap-y-1">
        <div
          v-if="isAuthenticated"
          :class="animationClasses"
          :style="getTransitionDelay(mainNavLinks.length + 1).value"
        >
          <InviteButton>
            <span class="link-md cursor-pointer text-white hover:underline">
              {{ t('common.inviteFriend') }}
            </span>
          </InviteButton>
        </div>
        <span
          class="transition-all ease-out"
          :class="animationClasses"
          :style="getTransitionDelay(mainNavLinks.length + 2).value"
        >
          <span
            :tabindex="0"
            class="link-md w-max cursor-pointer text-white hover:underline"
            :label="t('common.share')"
            @click="startShare"
            @keydown.enter="startShare"
          >
            {{ t('common.share') }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteNamedMap } from 'vue-router/auto-routes';
import { computed } from 'vue';
import { postTelemetry } from '@api/tracking.api';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@composables/useFanTracking';
import { useHeaderStore } from '@stores/header.store';
import { useTierStore } from '@stores/tier.store';
import { useRouter } from 'vue-router';
import { useShare } from '@vueuse/core';
import { useTranslation } from '@/locales/i18n';
import InviteButton from '@generics/Buttons/InviteButton.vue';
import { env } from '@/env';

type UserVisibility =
  | 'all'
  | 'authenticated'
  | 'unauthenticated'
  | 'authenticated-non-member'
  | 'member';

interface MainNavLink {
  id: string;
  label: string;
  visibility: UserVisibility;
  name?: keyof RouteNamedMap;
  action?: () => void;
}

const props = defineProps<{
  isAnimated?: boolean;
  canAnimate?: boolean;
}>();

const { t } = useTranslation();
const { share } = useShare();
const router = useRouter();
const fanStore = useFanStore();
const fanTracking = useFanTracking();
const headerStore = useHeaderStore();
const accountStore = useAccountStore();
const tierStore = useTierStore();
const { isAuthenticated, isMember } = storeToRefs(accountStore);
const { hasLiveTiers } = storeToRefs(tierStore);

const mainNavLinks = computed(() => {
  const links: MainNavLink[] = [
    {
      id: 'home',
      label: t('common.home'),
      name: 'Home',
      visibility: 'all',
    },
    {
      id: 'timeline',
      label: t('common.timeline'),
      name: 'Timeline',
      visibility: 'authenticated',
    },
    {
      id: 'subscribe',
      label: t('common.subscribe'),
      name: 'SignUp',
      visibility: 'authenticated-non-member',
    },
    {
      id: 'account',
      label: t('common.account'),
      name: 'Account',
      visibility: 'authenticated',
    },
    {
      id: 'login',
      label: t('common.login'),
      name: 'Login',
      visibility: 'unauthenticated',
    },
    {
      id: 'signup',
      label: t('common.signUp'),
      name: 'SignUp',
      visibility: 'unauthenticated',
    },
    {
      id: 'signout',
      label: t('common.signOut'),
      action: headerStore.signOut,
      visibility: 'authenticated',
    },
  ];

  return links;
});

const animationClasses = computed(() => {
  if (!props.canAnimate) return '';
  return props.isAnimated ? 'translate-y-0 opacity-100 duration-300' : 'translate-y-5 opacity-0';
});

const isLinkVisible = (link: MainNavLink): boolean => {
  switch (link.visibility) {
    case 'all':
      return true;
    case 'authenticated':
      return isAuthenticated.value;
    case 'unauthenticated':
      return !isAuthenticated.value;
    case 'authenticated-non-member':
      return isAuthenticated.value && !isMember.value && hasLiveTiers.value;
    case 'member':
      return isAuthenticated.value && isMember.value;
    default: {
      const _exhaustiveCheck: never = link.visibility;
      return false;
    }
  }
};

const availableNavItems = computed(() => mainNavLinks.value.filter(isLinkVisible));

const getTransitionDelay = (offset: number) => {
  return computed(() => {
    return {
      'transition-delay': `${props.canAnimate && props.isAnimated ? offset * 0.1 : '0'}s`,
    };
  });
};

const startShare = async () => {
  const title = env.VITE_SITE_TITLE;
  const text = env.VITE_SITE_DESCRIPTION;
  const url = env.VITE_HOME_URL;

  try {
    await share({
      title,
      text,
      url,
    });

    postTelemetry({
      metric: 'share',
      resource: window.location.href,
    });

    fanTracking.trackShared({
      title,
      text,
      url,
      fan_id: fanStore.fanId,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Share was cancelled');
    } else {
      console.error('Error sharing:', error);
    }
  }
};

const handleNavLinkClick = (item: MainNavLink) => {
  if (item.action) {
    item.action();
    return;
  }

  if (item.name) {
    const isCurrentRoute = router.currentRoute.value.name === item.name;

    if (isCurrentRoute) {
      headerStore.closeNav();
    }
  }
};
</script>
