<template>
  <Loader2 v-if="isLoading" class="h-6 w-6 animate-spin stroke-primary" />
  <div
    v-else
    class="group flex h-9 w-fit items-center justify-center gap-x-1 rounded-full border border-white px-3 uppercase"
    :class="[isClickable ? `cursor-pointer hover:bg-white` : '', backgroundClass]"
    @click="handleClick"
  >
    <span :class="[textClass, isClickable ? 'group-hover:text-black' : '']">
      {{ collection?.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { PostCollection } from '@api/postCollection.api';

import { Loader2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    collection: PostCollection;
    isLoading?: boolean;
    isClickable?: boolean;
    isActive?: boolean;
    navigateToHome?: boolean;
  }>(),
  {
    isActive: false,
    navigateToHome: false,
  },
);

const emit = defineEmits<{
  click: [filterId: string];
}>();

const router = useRouter();
const route = useRoute();

const backgroundClass = computed(() => {
  return props.isActive ? 'bg-white' : '';
});

const textClass = computed(() => {
  return props.isActive ? 'text-black' : 'text-white';
});

const handleClick = () => {
  if (!props.isClickable) return;

  if (props.navigateToHome && route.name !== 'Home') {
    router.push({
      name: 'Home',
      query: { filter: props.collection.id },
    });
  } else {
    emit('click', props.collection.id as string);
  }
};
</script>
