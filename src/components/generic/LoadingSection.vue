<template>
  <div v-if="isLoading" class="flex items-center justify-center gap-4 py-10">
    <Loader2 class="h-8 w-8 animate-spin" :class="isInverted ? 'stroke-white' : 'stroke-black'" />
    <span class="font-Matter text-3xl" :class="isInverted ? 'text-white' : 'text-black'">
      {{ message || t('common.loading') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';
import { Loader2 } from 'lucide-vue-next';

// Props
interface Props {
  message?: string;
  isLoading?: boolean;
  isInverted?: boolean;
}

withDefaults(defineProps<Props>(), {
  message: '',
  isLoading: true,
  isInverted: false,
});

// Composables
const { t } = useTranslation();
</script>
