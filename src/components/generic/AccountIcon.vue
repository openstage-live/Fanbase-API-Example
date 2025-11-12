<template>
  <div class="relative flex items-center justify-center">
    <div
      class="absolute flex h-8 w-8 items-center justify-center rounded-full"
      :class="isHeaderInverse ? 'bg-white' : 'bg-black'"
    >
      <img
        v-if="fanAvatarUrl && isAuthenticated"
        class="absolute h-8 w-8 overflow-hidden rounded-full object-cover"
        :src="fanAvatarUrl"
        :alt="t('avatar.avatarAlt')"
      />
      <UserRound v-else :color="isHeaderInverse ? 'black' : 'white'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import { useFanStore } from '@/stores/fan.store';
import { useTranslation } from '@/locales/i18n';

import { UserRound } from 'lucide-vue-next';

const { t } = useTranslation();

const fanStore = useFanStore();
const accountStore = useAccountStore();
const { fanAvatarUrl } = storeToRefs(fanStore);
const { isAuthenticated } = storeToRefs(accountStore);

defineProps<{
  isHeaderInverse?: boolean;
}>();
</script>
