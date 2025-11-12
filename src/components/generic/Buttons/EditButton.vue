<template>
  <Button
    type="button"
    variant="inputGhost"
    class="group w-max border-0 bg-transparent pr-1 shadow-none"
    :disabled="disabled || isLoading"
    @click="handleClick"
  >
    <SquarePen v-if="!isLoading" class="!h-5 !w-5 transition-transform group-hover:scale-110" />
    <Loader2 v-else class="stroke-magenta animate-spin" />
  </Button>
</template>

<script setup lang="ts">
import Button from '@ui/button/Button.vue';

import { Loader2, SquarePen } from 'lucide-vue-next';

interface EditButtonProps {
  disabled?: boolean;
  isEditing?: boolean;
  isLoading?: boolean;
}

interface EditButtonEmits {
  (e: 'click'): void;
}

const props = withDefaults(defineProps<EditButtonProps>(), {
  disabled: false,
  isEditing: false,
  isLoading: false,
});

const emit = defineEmits<EditButtonEmits>();

const handleClick = () => {
  if (!props.disabled && !props.isLoading && props.isEditing) {
    emit('click');
  }
};
</script>
