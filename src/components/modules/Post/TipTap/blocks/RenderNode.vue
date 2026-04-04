<template>
  <component :is="block" :node :addTelemetry>
    <template v-for="(child, index) in children" :key="index">
      <RenderNode :node="child" :addTelemetry />
    </template>
  </component>
</template>

<script setup lang="ts">
import type { JSONContent } from '@tiptap/core';
import { computed } from 'vue';
import BlockAudio from '@modules/Post/TipTap/blocks//BlockAudio.vue';
import BlockBlockquote from '@modules/Post/TipTap/blocks/BlockBlockquote.vue';
import BlockBulletList from '@modules/Post/TipTap/blocks/BlockBulletList.vue';
import BlockButton from '@modules/Post/TipTap/blocks/BlockButton.vue';
import BlockCarousel from '@modules/Post/TipTap/blocks/BlockCarousel.vue';
import BlockColumn from '@modules/Post/TipTap/blocks/BlockColumn.vue';
import BlockDocument from '@modules/Post/TipTap/blocks/BlockDocument.vue';
import BlockGallery from '@modules/Post/TipTap/blocks/BlockGallery.vue';
import BlockHardbreak from '@modules/Post/TipTap/blocks/BlockHardbreak.vue';
import BlockHeading from '@modules/Post/TipTap/blocks/BlockHeading.vue';
import BlockHorizontalRule from '@modules/Post/TipTap/blocks/BlockHorizontalRule.vue';
import BlockImage from '@modules/Post/TipTap/blocks/BlockImage.vue';
import BlockListItem from '@modules/Post/TipTap/blocks/BlockListItem.vue';
import BlockMergeTag from '@modules/Post/TipTap/blocks/BlockMergeTag.vue';
import BlockOrderedList from '@modules/Post/TipTap/blocks/BlockOrderedList.vue';
import BlockParagraph from '@modules/Post/TipTap/blocks/BlockParagraph.vue';
import BlockSection from '@modules/Post/TipTap/blocks/BlockSection.vue';
import BlockSocial from '@modules/Post/TipTap/blocks/BlockSocial.vue';
import BlockSpotify from '@modules/Post/TipTap/blocks/BlockSpotify.vue';
import BlockText from '@modules/Post/TipTap/blocks/BlockText.vue';
import BlockUnknown from '@modules/Post/TipTap/blocks/BlockUnknown.vue';
import BlockVideo from '@modules/Post/TipTap/blocks/BlockVideo.vue';
import BlockVimeo from '@modules/Post/TipTap/blocks/BlockVimeo.vue';
import BlockYouTube from '@modules/Post/TipTap/blocks/BlockYouTube.vue';

export interface NodeProps {
  node: JSONContent;
  addTelemetry?: (metric: string) => void;
}

const props = defineProps<NodeProps>();

const children = computed<JSONContent[]>(() => {
  const content = [...(props.node.content ?? [])];

  // Duplicate trailing hardBreak to preserve line break rendering
  const lastChild = content.at(-1);
  if (lastChild?.type === 'hardBreak') {
    content.push(lastChild);
  }

  return content;
});

const block = computed(() => {
  const type = props.node.type;

  if (!type) return BlockDocument;

  switch (type) {
    case 'audio':
      return BlockAudio;
    case 'blockquote':
      return BlockBlockquote;
    case 'bulletList':
      return BlockBulletList;
    case 'button':
      return BlockButton;
    case 'carousel':
      return BlockCarousel;
    case 'column':
      return BlockColumn;
    case 'doc':
      return BlockDocument;
    case 'gallery':
      return BlockGallery;
    case 'hardBreak':
      return BlockHardbreak;
    case 'heading':
      return BlockHeading;
    case 'horizontalRule':
      return BlockHorizontalRule;
    case 'image':
      return BlockImage;
    case 'listItem':
      return BlockListItem;
    case 'mergeTag':
      return BlockMergeTag;
    case 'orderedList':
      return BlockOrderedList;
    case 'paragraph':
      return BlockParagraph;
    case 'section':
      return BlockSection;
    case 'social':
      return BlockSocial;
    case 'spotify':
      return BlockSpotify;
    case 'text':
      return BlockText;
    case 'video':
      return BlockVideo;
    case 'vimeo':
      return BlockVimeo;
    case 'youtube':
      return BlockYouTube;
    default:
      return BlockUnknown;
  }
});
</script>
