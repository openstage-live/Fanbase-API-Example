<template>
  <div class="mx-auto text-center">
    <div class="rounded-lg bg-red-500 p-8">
      <div class="mb-8">
        <CircleAlert class="mx-auto h-12 w-12 stroke-white" />
      </div>
      <h3 class="title mb-4 font-Matter text-3xl text-white">
        {{ t('errors.postLoadFailed') }}
      </h3>
      <p class="text-md mb-8 text-white">
        {{ t('errors.postLoadFailedDescription') }}
      </p>
      <Button class="inline-flex items-center gap-2" @click="postStore.fetchPostList()">
        <RefreshCcw class="h-5 w-5 stroke-white" />
        {{ t('common.retry') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert, RefreshCcw } from 'lucide-vue-next';
import { useTranslation } from '@/locales/i18n';
import { usePostStore } from '@stores/post.store';
import Button from '@ui/button/Button.vue';

const { t } = useTranslation();
const postStore = usePostStore();
</script>
