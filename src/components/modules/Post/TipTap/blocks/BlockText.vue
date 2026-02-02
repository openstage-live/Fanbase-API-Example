<template>
  <span ref="htmlRef" />
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { Bold } from '@tiptap/extension-bold';
import { Code } from '@tiptap/extension-code';
import { Document } from '@tiptap/extension-document';
import { DOMSerializer, Fragment, Mark } from '@tiptap/pm/model';
import { getSchema } from '@tiptap/core';
import { Highlight } from '@tiptap/extension-highlight';
import { Italic } from '@tiptap/extension-italic';
import { Paragraph } from '@tiptap/extension-paragraph';
import { postTelemetry } from '@/api/tracking.api';
import { ref, watchEffect, onUnmounted } from 'vue';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { usePostStore } from '@/stores/post.store';
import Link from '@tiptap/extension-link';

const props = defineProps<NodeProps>();
const htmlRef = ref<HTMLElement | null>(null);
const schema = getSchema([Document, Paragraph, Highlight, Link, Bold, Italic, Strike, Code, Text]);
const serializer = DOMSerializer.fromSchema(schema);
const postStore = usePostStore();

// Store cleanup functions for link listeners
const linkListenerCleanups: (() => void)[] = [];

const cleanupLinkListeners = () => {
  linkListenerCleanups.forEach((cleanup) => cleanup());
  linkListenerCleanups.length = 0;
};

watchEffect(() => {
  if (!htmlRef.value) return;

  // Clean up previous listeners
  cleanupLinkListeners();

  const text = props.node.text ?? '';

  if (!props.node.marks?.length) {
    htmlRef.value.textContent = text;
    return;
  }

  const marks = props.node.marks.map((mark) => Mark.fromJSON(schema, mark));
  const fragment = Fragment.fromArray([schema.text(text, marks)]);
  const serializedFragment = serializer.serializeFragment(fragment);

  htmlRef.value.innerHTML = '';
  htmlRef.value.appendChild(serializedFragment);

  // Add telemetry listeners to links
  const links = htmlRef.value.querySelectorAll('a');
  links.forEach((link) => {
    const handleClick = () => {
      postTelemetry({
        metric: 'link-click-post',
        resource: link.href,
        resourceId: postStore.post?.id,
      });
    };
    link.addEventListener('click', handleClick);
    linkListenerCleanups.push(() => link.removeEventListener('click', handleClick));
  });
});

onUnmounted(() => {
  cleanupLinkListeners();
});
</script>

<style scoped>
:deep(strong) {
  font-weight: bold;
}

:deep(em) {
  font-style: italic;
}

:deep(u) {
  text-decoration: underline;
}

:deep(s) {
  text-decoration: line-through;
}

:deep(code) {
  font-family: 'Courier New', Courier, monospace;
}

:deep(mark) {
  background-color: yellow;
}

:deep(a) {
  color: #0066cc;
  text-decoration: underline;
}

:deep(a:hover) {
  color: #004499;
}

:deep(a:visited) {
  color: #663399;
}
</style>
