<template>
  <Button
    v-if="isSupported"
    :disabled="disabled"
    @click="startShare"
    variant="outlineInverse"
    class="group rounded-lg px-2 opacity-80 transition hover:opacity-100 focus:outline-none focus-visible:outline-none"
    @mousedown.prevent
  >
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      <Share class="!h-6 !w-6" :class="isWhite ? 'stroke-white' : 'stroke-black'" />
    </template>
  </Button>
  <DropdownMenu v-else>
    <DropdownMenuTrigger>
      <Button
        variant="outlineInverse"
        class="group focus:outline-none focus-visible:outline-none"
        @mousedown.prevent
      >
        <div
          class="share-button !h-6 !w-6 cursor-pointer opacity-80 group-hover:opacity-100"
          :class="isWhite && 'share-button--white'"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem v-for="network in networks" :key="network.network">
        <ShareNetwork
          :network="network.network"
          :title="props.title"
          :description="stripHtml(props.text)"
          :media="props.media"
          :url="props.url"
          v-slot="{ share }"
        >
          <span @click="share">{{ t('common.shareOn') }} {{ network.name }}</span>
        </ShareNetwork>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { useShare } from '@vueuse/core';
import { useTranslation } from '@/locales/i18n';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@/composables/useFanTracking';
import { postTelemetry } from '@/api/tracking.api';

import { ShareNetwork } from 'vue3-social-sharing';
import Button from '@ui/button/Button.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { Share } from 'lucide-vue-next';

const { t } = useTranslation();
const fanStore = useFanStore();
const fanTracking = useFanTracking();

const networks = [
  {
    network: 'facebook',
    name: 'Facebook',
  },
  {
    network: 'whatsapp',
    name: 'Whatsapp',
  },
  {
    network: 'email',
    name: 'Email',
  },
  {
    network: 'sms',
    name: 'SMS',
  },
];

interface ShareProps {
  title: string;
  text?: string;
  postId?: string;
  url: string;
  media?: string;
  disabled?: boolean;
  isWhite?: boolean;
}

const props = defineProps<ShareProps>();

const { share, isSupported } = useShare();

const stripHtml = (html: string | undefined): string => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const startShare = async () => {
  if (props.disabled) return;

  try {
    const shareText = stripHtml(props.text);

    await share({
      title: props.title,
      text: shareText,
      url: props.url,
    });

    postTelemetry({
      metric: 'share',
      resourceId: props.postId,
      resource: props.url,
    });

    fanTracking.trackShared({
      title: props.title,
      text: shareText,
      url: props.url,
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
</script>
