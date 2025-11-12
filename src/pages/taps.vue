<template>
  <div class="layout-frame">
    <div class="container relative z-10">
      <div class="relative z-10 flex min-h-dvh flex-col items-center justify-center">
        <div v-if="isTagFetching" class="mb-8">
          <p>{{ t('taps.scanningTag') }}</p>
        </div>
        <div v-else-if="tagError" class="mb-8 rounded-lg bg-red-100 p-4 text-red-700">
          <p>{{ t('errors.couldNotScanTag') }}</p>
        </div>
        <div v-else-if="tagVerified" class="mb-8 rounded-lg bg-green/70 p-4 text-green/70">
          <p>Tag verified. Redirecting..</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useZatapStore } from '@/stores/zatap.store';
import { storeToRefs } from 'pinia';
import { useTranslation } from '@/locales/i18n';

definePage({
  name: 'Taps',
  meta: {
    public: true,
    noHeader: true,
    noFooter: true,
    bgColor: 'white',
  },
});

const { t } = useTranslation();
const zatapStore = useZatapStore();
const { tagError, isTagFetching, tagVerified } = storeToRefs(zatapStore);

// can we use route.query instead?
const queryParams = new URLSearchParams(window.location.search);
const tag = queryParams.get('tag');

onMounted(async () => {
  if (tag) await zatapStore.fetchTag(tag);
  else {
    // set tagError
    tagError.value = t('errors.couldNotScanTag');
  }
});
</script>
