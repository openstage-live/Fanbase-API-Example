<template>
  <section v-if="!attrs.hideOnWeb" class="section">
    <div class="section__content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { getSectionAttrs } from '@modules/Post/TipTap/extensions/Section/SectionExtension';
import { computed } from 'vue';

const props = defineProps<NodeProps>();
const attrs = computed(() => getSectionAttrs(props.node.attrs));
</script>

<style scoped>
.section {
  padding-top: v-bind('attrs.outerSpacingTop + "px"');
  padding-right: v-bind('attrs.outerSpacingRight + "px"');
  padding-bottom: v-bind('attrs.outerSpacingBottom + "px"');
  padding-left: v-bind('attrs.outerSpacingLeft + "px"');
}

.section__content {
  border-top-left-radius: v-bind('attrs.borderRadiusTopLeft + "px"');
  border-top-right-radius: v-bind('attrs.borderRadiusTopRight + "px"');
  border-bottom-right-radius: v-bind('attrs.borderRadiusBottomRight + "px"');
  border-bottom-left-radius: v-bind('attrs.borderRadiusBottomLeft + "px"');
  border-color: v-bind('attrs.borderColor');
  border-style: v-bind('attrs.borderStyle');
  border-width: v-bind('attrs.borderWidth + "px"');
  padding-top: v-bind('attrs.innerSpacingTop + "px"');
  padding-right: v-bind('attrs.innerSpacingRight + "px"');
  padding-bottom: v-bind('attrs.innerSpacingBottom + "px"');
  padding-left: v-bind('attrs.innerSpacingLeft + "px"');
  width: 100%;
  overflow: hidden;
}
</style>
