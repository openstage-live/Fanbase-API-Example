<template>
  <PageTitle
    :title="t('signUp.thankYouTitle')"
    :subtitle="t('signUp.thankYouSubtitle', { fanEmail })"
  />
  <h2 class="subtitle text-center">{{ t('signUp.thankYouDescription') }}</h2>
  <div class="mx-auto flex items-center gap-2 text-sm">
    <span class="link cursor-pointer text-sm underline" @click="accountStore.sendSignUp(fanEmail)">
      {{ t('signUp.noLink') }} {{ t('signUp.sendAgain') }}
    </span>
    <span>|</span>
    <span @click="$emit('restartSignup')" class="link cursor-pointer text-sm underline">
      {{ t('signUp.didYouMisspellEmail') }}
    </span>
  </div>
  <InfoBar
    v-if="sendSignUpData || sendSignUpError"
    :variant="sendSignUpData ? 'success' : 'destructive'"
    class="mt-4"
    :title="sendSignUpData ? t('common.success') : t('common.error')"
    :message="sendSignUpError || t('signUp.thankYouSubtitle', { fanEmail })"
    @close="
      sendSignUpData = null;
      sendSignUpError = null;
    "
  />
</template>
<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';
import { useAccountStore } from '@stores/account.store';
import { storeToRefs } from 'pinia';

import PageTitle from '@generics/PageTitle.vue';
import InfoBar from '@generics/InfoBar.vue';

defineProps<{
  fanEmail: string;
}>();

defineEmits<{
  (e: 'restartSignup'): void;
}>();

const { t } = useTranslation();
const accountStore = useAccountStore();
const { sendSignUpData, sendSignUpError } = storeToRefs(accountStore);
</script>
