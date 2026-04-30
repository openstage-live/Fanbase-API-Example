<template>
  <div class="layout-frame">
    <LoadingSection
      v-if="accountStore.isLoginMagicLinkFetching"
      :isLoading="accountStore.isLoginMagicLinkFetching"
    />
    <template v-else>
      <PageTitle :title="t('login.title')" />
      <MagicLinkForm v-if="loginMethod === 'magicLink'" />
      <LoginForm v-else-if="loginMethod === 'password'" />
      <InfoBar
        v-if="loginMagicLinkError"
        variant="destructive"
        :title="t('common.error')"
        :message="loginMagicLinkError"
        @close="loginMagicLinkError = null"
      />
      <div
        class="flex flex-col items-center justify-center gap-4 text-sm"
        :class="{ 'pointer-events-none opacity-50': isLoginFanFetching }"
      >
        <div class="flex items-center gap-2">
          <span
            class="cursor-pointer text-sm underline underline-offset-2"
            :class="{ 'pointer-events-none opacity-50': isLoginFanFetching }"
            @click="loginMethod = loginMethod === 'magicLink' ? 'password' : 'magicLink'"
          >
            {{
              loginMethod === 'magicLink'
                ? t('common.usePasswordInstead')
                : t('common.useMagicLinkInstead')
            }}
          </span>
          <template v-if="loginMethod === 'password'">
            <span>|</span>
            <RouterLink
              class="text-sm underline underline-offset-2"
              :to="{ name: 'ForgotPassword' }"
              :class="{ 'pointer-events-none opacity-50': isLoginFanFetching }"
            >
              {{ t('common.forgotPassword') }}
            </RouterLink>
          </template>
        </div>
        <SignUpLink />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import { useRoute } from 'vue-router';
import { useTranslation } from '@/locales/i18n';

import SignUpLink from '@generics/SignUpLink.vue';
import LoadingSection from '@generics/LoadingSection.vue';
import InfoBar from '@generics/InfoBar.vue';
import LoginForm from '@modules/Forms/LoginForm.vue';
import MagicLinkForm from '@modules/Forms/MagicLinkForm.vue';
import PageTitle from '@generics/PageTitle.vue';

definePage({
  name: 'Login',
  meta: {
    bgColor: 'white',
  },
});

const { t } = useTranslation();
const route = useRoute();
const accountStore = useAccountStore();
const { loginMagicLinkError, isLoginFanFetching } = storeToRefs(accountStore);

const initialMethod = route.query.method === 'password' ? 'password' : 'magicLink';
const loginMethod = ref<'magicLink' | 'password'>(initialMethod);

const token = computed(() => (route.query.token as string) || '');

onMounted(async () => {
  if (token.value) {
    // Get friend ID from localStorage if it exists (for referral tracking)
    const friendId = localStorage.getItem('friendId') || undefined;

    // Attempt to log in the user with magic link token and optional friend ID
    await accountStore.loginMagicLink(token.value, friendId);

    // Clean up friend ID from localStorage after login attempt
    localStorage.removeItem('friendId');
  }
});
</script>
