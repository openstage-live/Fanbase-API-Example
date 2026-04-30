<template>
  <Alert :variant="variant" @click="emit('close')">
    <TriangleAlert v-if="variant === 'destructive'" class="h-4 w-4 !stroke-white" />
    <Rocket
      v-else-if="variant === 'success'"
      class="!fill-green-800 stroke-green-800 h-4 w-4 dark:stroke-white"
    />
    <AlertTitle class="mb-1 font-semibold text-current">{{ title }}</AlertTitle>
    <AlertDescription v-if="message" class="text-current first-letter:uppercase">
      {{ message }}
    </AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { AlertTitle, AlertDescription, Alert, type AlertVariants } from '@ui/alert';
import { TriangleAlert, Rocket } from 'lucide-vue-next';

interface InfoBarProps {
  variant?: AlertVariants['variant'];
  title: string;
  message?: string;
}

const emit = defineEmits<{
  close: [];
}>();

withDefaults(defineProps<InfoBarProps>(), {
  variant: 'default',
});
</script>
