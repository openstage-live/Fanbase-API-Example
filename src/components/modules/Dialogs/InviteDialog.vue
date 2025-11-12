<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="border-white/20 bg-black">
      <DialogHeader>
        <DialogTitle class="text-center font-Matter text-4xl font-light uppercase text-white">
          {{ t('widgets.invite.title') }}
        </DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <p class="mb-4 text-center font-Matter text-base font-light text-light-grey lg:text-lg">
          {{ t('widgets.invite.description') }}
        </p>
        <div
          class="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-2"
        >
          <Skeleton v-if="isFetchingLink" class="h-4 w-3/4" />
          <p v-else class="truncate font-Matter text-sm text-light-grey">
            {{ inviteUrl }}
          </p>
          <Copy
            color="white"
            class="h-6 w-6"
            :class="isFetchingLink ? 'opacity-50' : 'cursor-pointer'"
            :disabled="isFetchingLink"
            @click="copyToClipboard"
          />
        </div>
        <p v-if="copyMessage" class="m-0 mt-4 text-center font-Matter text-base text-white">
          {{ copyMessage }}
        </p>
      </DialogDescription>
      <DialogFooter>
        <Button class="mx-auto w-fit" :disabled="isFetchingLink" @click="startShare">
          {{ t('widgets.invite.buttonLabel') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { useShare } from '@vueuse/core';
import { postTelemetry } from '@/api/tracking.api';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@/composables/useFanTracking';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Skeleton } from '@ui/skeleton';
import { Copy } from 'lucide-vue-next';
import { env } from '@/env';

const { t } = useTranslation();
const fanStore = useFanStore();
const fanTracking = useFanTracking();

const isOpen = ref(false);
const isFetchingLink = ref(false);
const inviteUrl = ref('');
const copyMessage = ref('');
const copySuccess = ref(false);

const onOpenChange = (open: boolean) => {
  isOpen.value = open;
};

const open = async () => {
  if (isFetchingLink.value) return;

  isFetchingLink.value = true;
  isOpen.value = true;

  try {
    await fanStore.getFriendLink({ url: env.VITE_HOME_URL + '/signup' });

    if (fanStore.getFriendLinkData) {
      inviteUrl.value = fanStore.getFriendLinkData.link || '';
    }
  } catch (error) {
    console.error('Failed to get friend link:', error);
    isOpen.value = false;
  } finally {
    isFetchingLink.value = false;
  }
};

const { share } = useShare();

const startShare = async () => {
  try {
    const title = env.VITE_SITE_TITLE;
    const text = env.VITE_SITE_DESCRIPTION;

    await share({
      title: title,
      text: text,
      url: inviteUrl.value,
    });

    postTelemetry({
      metric: 'invite',
      resource: window.location.href,
    });

    fanTracking.trackShared({
      title: title,
      text: text,
      url: inviteUrl.value,
      fan_id: fanStore.fanId,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Share was cancelled by user, we can handle this case if needed
      console.log('Share was cancelled');
    } else {
      // Handle other potential errors
      console.error('Error sharing:', error);
    }
  }
};

const copyToClipboard = async () => {
  if (isFetchingLink.value) return;

  copyMessage.value = '';

  try {
    await navigator.clipboard.writeText(inviteUrl.value);
    copyMessage.value = t('widgets.invite.urlCopied');
    copySuccess.value = true;

    // Track copy action
    postTelemetry({
      metric: 'invite',
      resource: window.location.href,
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      copyMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to copy URL:', error);
    copyMessage.value = t('widgets.invite.copyFailed');
    copySuccess.value = false;

    // Clear error message after 3 seconds
    setTimeout(() => {
      copyMessage.value = '';
    }, 3000);
  }
};

// Expose the open method to parent components
defineExpose({
  open,
});
</script>
