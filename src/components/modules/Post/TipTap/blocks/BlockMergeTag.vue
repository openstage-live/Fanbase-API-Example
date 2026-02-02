<template>
  <BlockText :node="textNode" />
</template>

<script setup lang="ts">
import type { JSONContent } from '@tiptap/core';
import type { NodeProps } from './RenderNode.vue';
import type { MergeTagValue } from '../extensions/MergeTag/MergeTagExtension';
import { computed } from 'vue';
import { getMergeTagAttrs } from '../extensions/MergeTag/MergeTagExtension';
import { useFanStore } from '@/stores/fan.store';
import { useRoute } from 'vue-router';
import BlockText from './BlockText.vue';

const props = defineProps<NodeProps>();
const fanStore = useFanStore();
const route = useRoute();

const shareSecret = computed(() => {
  const s = route.query.shareSecret;
  return (Array.isArray(s) ? s[0] : s) || undefined;
});

const replaceTags = computed<Record<MergeTagValue, string>>(() => {
  return {
    '{{fan_first_name}}': fanStore.fanData?.firstName || (shareSecret.value ? 'Sue' : ''),
    '{{fan_last_name}}': fanStore.fanData?.lastName || (shareSecret.value ? 'Perfan' : ''),
    '{{fan_email}}': fanStore.fanData?.email || (shareSecret.value ? 'sue@perfan.com' : ''),
  };
});

const attrs = computed(() => getMergeTagAttrs(props.node.attrs));

const displayValue = computed(() => {
  return replaceTags.value[attrs.value.value] || '';
});

const textNode = computed<JSONContent>(() => ({
  type: 'text',
  text: displayValue.value,
  marks: props.node.marks,
}));
</script>
