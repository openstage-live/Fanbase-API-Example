<template>
  <div class="flex min-h-dvh flex-col items-center justify-center gap-y-4 px-4">
    <h1 class="mb-4 max-w-xl text-center text-2xl uppercase leading-tight text-white lg:text-4xl">
      {{ title || t('errors.contentErrorTitle') }}
    </h1>
    <h2 class="mb-4 max-w-xl text-center text-lg leading-tight text-white lg:text-xl">
      {{ subtitle || t('errors.contentErrorSubtitle') }}
    </h2>
    <RouterLink :to="{ name: routeName || 'Home' }">
      <Button variant="white">{{ buttonLabel || t('errors.backToHome') }}</Button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import type { RouteNamedMap } from 'vue-router/auto-routes';
import { useTranslation } from '@/locales/i18n';
import { Button } from '@ui/button';

interface Props {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  routeName?: keyof RouteNamedMap;
}

defineProps<Props>();
const { t } = useTranslation();
</script>
