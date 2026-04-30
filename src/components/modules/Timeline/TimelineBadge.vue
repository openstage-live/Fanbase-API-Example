<template>
  <Loader2 v-if="isLoading" class="h-6 w-6 animate-spin stroke-white" />
  <div
    v-else
    class="group flex h-9 w-fit items-center justify-center gap-x-1 rounded-full uppercase"
    :class="[
      variant === 'text' ? 'border border-white px-3' : '',
      variant === 'text-icon' ? 'border border-white pl-2 pr-3' : '',
      isClickable ? `cursor-pointer hover:bg-white` : '',
      isActive ? 'bg-white' : '',
    ]"
    @click="handleClick"
  >
    <component
      v-if="iconComponent"
      :is="iconComponent"
      :color="isActive ? 'black' : 'white'"
      class="h-5 w-5 group-hover:stroke-black"
    />
    <span
      v-if="variant === 'text' || variant === 'text-icon'"
      :class="[textClass, isClickable ? 'group-hover:text-black' : '']"
    >
      {{ getTimelineLabel(type) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '@/locales/i18n';
import type { TimelineItemType } from '@/stores/timeline.store';
import { Loader2, MapPin, Smartphone, Download, BookUser } from 'lucide-vue-next';

type Variant = 'text' | 'icon' | 'text-icon';

const props = withDefaults(
  defineProps<{
    type: TimelineItemType;
    variant?: Variant;
    isLoading?: boolean;
    isClickable?: boolean;
    isActive?: boolean;
  }>(),
  {
    variant: 'text-icon',
    isActive: false,
  },
);

const emit = defineEmits<{
  click: [filterType: TimelineItemType];
}>();

const { t } = useTranslation();

const iconComponent = computed(() => {
  const componentMap = {
    'my-story': MapPin,
    'check-ins': Smartphone,
    download: Download,
    friends: BookUser,
  } as const;

  return componentMap[props.type];
});

const textClass = computed(() => {
  return props.isActive ? 'text-black' : 'text-white';
});

const getTimelineLabel = (type: TimelineItemType): string => {
  switch (type) {
    case 'my-story':
      return t('profile.myStory');
    case 'check-ins':
      return t('profile.checkIns');
    case 'download':
      return t('profile.download');
    case 'friends':
      return t('profile.invites');
    default:
      return type;
  }
};

const handleClick = () => {
  if (!props.isClickable) return;

  // Emit click event for local filtering
  emit('click', props.type);
};
</script>
