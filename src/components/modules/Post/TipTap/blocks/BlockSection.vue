<template>
  <section
    v-if="!attrs.hideOnWeb"
    class="section"
    :class="{ 'has-columns': hasColumns }"
    :style="sectionStyle"
  >
    <slot />
  </section>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { computed, type CSSProperties } from 'vue';
import { getSectionAttrs } from '@modules/Post/TipTap/extensions/Section/SectionExtension';

const props = defineProps<NodeProps>();
const attrs = computed(() => getSectionAttrs(props.node.attrs));

const hasColumns = computed(() => {
  const content = props.node.content;
  if (!content || content.length === 0) return false;
  return content.every((child) => child.type === 'column');
});

const gridStyles = computed<CSSProperties>(() => ({
  display: 'grid',
  gap: `${attrs.value.gap}px`,
  gridTemplateColumns: `repeat(${props.node.content?.length ?? 1}, 1fr)`,
}));

const sectionStyle = computed<CSSProperties>(() => ({
  ...(hasColumns.value ? gridStyles.value : {}),
  backgroundColor: attrs.value.backgroundColor ?? undefined,
  backgroundImage: attrs.value.backgroundImage ? `url(${attrs.value.backgroundImage})` : undefined,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  borderBottomLeftRadius: `${attrs.value.borderRadiusBottomLeft}px`,
  borderBottomRightRadius: `${attrs.value.borderRadiusBottomRight}px`,
  borderColor: attrs.value.borderColor ?? undefined,
  borderStyle: attrs.value.borderStyle,
  borderTopLeftRadius: `${attrs.value.borderRadiusTopLeft}px`,
  borderTopRightRadius: `${attrs.value.borderRadiusTopRight}px`,
  borderWidth: `${attrs.value.borderWidth}px`,
  paddingBottom: `${attrs.value.paddingBottom}px`,
  paddingLeft: `${attrs.value.paddingLeft}px`,
  paddingRight: `${attrs.value.paddingRight}px`,
  paddingTop: `${attrs.value.paddingTop}px`,
}));
</script>

<style scoped>
@media (max-width: 480px) {
  .section.has-columns {
    grid-template-columns: 1fr !important;
  }
}
</style>
