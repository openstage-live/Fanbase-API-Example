<template>
  <component :is="wrapperTag" v-bind="wrapperAttrs" class="image" @click="onClick">
    <RichImage
      :image="attrs.image"
      :width="attrs.maxWidth"
      :align="attrs.align"
      :show-caption="attrs.showCaption"
      :aspect-ratio="attrs.aspectRatio"
    />
  </component>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed } from 'vue';
import { downloadFile } from '@/utils/download';
import { getImageAttrs } from '@modules/Post/TipTap/extensions/Image/ImageExtension';
import { postTelemetry } from '@/api/tracking.api';
import { usePostStore } from '@/stores/post.store';
import RichImage from './RichImage.vue';

const props = defineProps<NodeProps>();
const postStore = usePostStore();

const attrs = computed(() => getImageAttrs(props.node.attrs));
const isDownload = computed(() => attrs.value.type === 'download');
const wrapperTag = computed(() => (attrs.value.href ? 'a' : 'div'));
const wrapperAttrs = computed(() =>
  isDownload.value ? {} : { href: attrs.value.href, target: '_blank', rel: 'noopener' },
);

function onClick() {
  if (!attrs.value.href) return;

  if (isDownload.value) {
    downloadFile(attrs.value.href);
    props.addTelemetry?.('download');
  } else {
    postTelemetry({
      metric: 'link-click-post',
      resource: attrs.value.href,
      resourceId: postStore.post?.id,
    });
  }
}
</script>
