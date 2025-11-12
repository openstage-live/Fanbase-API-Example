<template>
  <div class="text-center text-sm">
    {{ t('common.haveAnAccount') }}
    <RouterLink class="underline underline-offset-2" :to="{ name: 'Login' }">
      {{ t('common.signIn') }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';

const { t } = useTranslation();
</script>
