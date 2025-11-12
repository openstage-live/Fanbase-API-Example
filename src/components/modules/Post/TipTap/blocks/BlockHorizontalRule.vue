<template>
  <hr class="divider" />
</template>

<script setup lang="ts">
import type { JSONContent } from '@tiptap/core';
import { computed } from 'vue';
import { getHorizontalRuleAttrs } from '../extensions/HorizontalRule/HorizontalRuleExtension';

const props = defineProps<{
  node: JSONContent;
}>();

const attrs = computed(() => getHorizontalRuleAttrs(props.node.attrs));
</script>

<style scoped lang="postcss">
.divider {
  @apply border-t border-black;
  border-top: v-bind('attrs.width + "px"') v-bind('attrs.style') v-bind('attrs.color');
}
</style>
