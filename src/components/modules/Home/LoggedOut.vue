<template>
  <div class="container border-l border-r border-white/10 px-0 pt-16">
    <PostFeed />
    <div
      class="mx-auto my-16 w-[90%] rounded-2xl border border-white/10 p-8 text-center lg:w-[80%]"
    >
      <h2 class="mb-8 font-Matter text-3xl font-bold text-white">
        {{ t('home.joinTheCommunity') }}
      </h2>
      <p class="mb-6 font-Matter text-lg text-white/90">
        {{ t('home.getExclusiveAccess') }}
      </p>
      <RouterLink :to="{ name: 'SignUp' }">
        <Button variant="white">{{ t('home.signUpNow') }}</Button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';

import { Button } from '@ui/button';
import PostFeed from '@modules/PostFeed/PostFeed.vue';

const { t } = useTranslation();
</script>
