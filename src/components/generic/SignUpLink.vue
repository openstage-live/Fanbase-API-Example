<template>
  <div class="text-center text-sm">
    {{ t('common.dontHaveAnAccount') }}
    <RouterLink class="underline underline-offset-2" :to="{ name: 'SignUp' }">
      {{ t('common.signUp') }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';

const { t } = useTranslation();
</script>
