<template>
  <div
    class="flex flex-col items-center gap-4 rounded-lg border border-white/20 px-4 py-8 text-center"
  >
    <Lock class="h-10 w-10 stroke-white/40" />
    <h4 class="font-Matter-Medium text-xl uppercase text-white">{{ t('gate.title') }}</h4>
    <p class="text-sm text-white/70">{{ t('gate.description') }}</p>
    <Button v-if="!isMember" as-child>
      <RouterLink :to="{ name: 'SignUp' }">{{ t('common.joinUs') }}</RouterLink>
    </Button>
    <RouterLink
      v-if="!isAuthenticated"
      class="text-sm text-white underline underline-offset-2"
      :to="{ name: 'Login' }"
      @click="setInterruptedPath"
    >
      {{ t('common.signIn') }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { Lock } from 'lucide-vue-next';
import { useTranslation } from '@/locales/i18n';
import { useAccountStore } from '@stores/account.store';
import Button from '@ui/button/Button.vue';

defineProps<Partial<NodeProps>>();

const { t } = useTranslation();
const route = useRoute();
const { isAuthenticated, isMember } = storeToRefs(useAccountStore());

const setInterruptedPath = () => localStorage.setItem('interruptedPath', route.fullPath);
</script>
