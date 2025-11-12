<template>
  <div @click.stop="openInviteDialog">
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else>
      <div
        class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white transition-all duration-200 hover:scale-110 md:h-12 md:w-12"
      >
        <UserRoundPlus color="white" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { openInviteDialogKey } from '@/utils/symbols';
import { UserRoundPlus } from 'lucide-vue-next';

const openInviteDialog = inject(openInviteDialogKey);
</script>
