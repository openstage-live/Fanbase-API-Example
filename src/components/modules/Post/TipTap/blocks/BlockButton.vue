<template>
  <div class="button-wrapper">
    <Button
      v-bind="buttonAttrs"
      :variant="buttonVariant"
      @click="onClick"
      class="post-button"
      :style="{ width: buttonWidth }"
    >
      <slot />
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { ButtonVariants } from '@ui/button';
import type { NodeProps } from './RenderNode.vue';
import { computed } from 'vue';
import { downloadFile } from '@/utils/download';
import { getButtonAttrs } from '../extensions/Button/ButtonExtension';
import Button from '@ui/button/Button.vue';

const props = defineProps<NodeProps>();

const attrs = computed(() => getButtonAttrs(props.node.attrs));

const isDownload = computed(() => attrs.value.type === 'download');

const buttonAttrs = computed(() =>
  isDownload.value
    ? { as: 'button' }
    : { as: 'a', href: attrs.value.href, target: '_blank', rel: 'noopener' },
);

const justifyContent = computed(() => {
  return attrs.value.textAlign === 'justify' ? 'stretch' : attrs.value.textAlign;
});

const buttonWidth = computed(() => {
  return attrs.value.textAlign === 'justify' ? '100%' : 'auto';
});

const buttonVariant = computed<ButtonVariants['variant']>(() => {
  switch (attrs.value.preset) {
    case 'primary':
      return 'white';
    case 'secondary':
      return 'outline';
    default:
      return 'white';
  }
});

function onClick() {
  if (isDownload.value && attrs.value.href) {
    downloadFile(attrs.value.href);
    props.addTelemetry('download');
  }
}
</script>

<style scoped>
.button-wrapper {
  display: flex;
  justify-content: v-bind('justifyContent');
  align-items: center;
}

.button {
  width: v-bind('buttonWidth');
}
</style>
