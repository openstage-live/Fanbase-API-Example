<template>
  <div class="layout-frame lg:mt-8 lg:gap-y-8">
    <InfoBar
      v-if="loginChangeEmailError"
      variant="destructive"
      :title="t('common.error')"
      :message="t('changeEmail.fail')"
      @close="loginChangeEmailError = null"
    />
    <div v-if="loginChangeEmailData" class="flex flex-col items-center gap-4">
      <InfoBar
        variant="success"
        :title="t('common.success')"
        :message="t('changeEmail.success')"
        @close="loginChangeEmailData = null"
      />
      <Button @click.stop="goToLogin">
        {{ t('changeEmail.login') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Base64 } from 'js-base64';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import { useRoute, useRouter } from 'vue-router';
import { useTranslation } from '@/locales/i18n';

import Button from '@ui/button/Button.vue';
import InfoBar from '@generics/InfoBar.vue';

definePage({
  name: 'ChangeEmail',
  meta: {
    public: true,
  },
  beforeEnter: (to, _, next) => (!to.query.token ? next({ name: 'Home' }) : next()),
});

const { t } = useTranslation();
const route = useRoute();
const router = useRouter();
const accountStore = useAccountStore();
const { loginChangeEmailError, loginChangeEmailData } = storeToRefs(accountStore);

const goToLogin = () => router.push({ name: 'Login' });

onMounted(async () => {
  accountStore.logoutFan();

  const { token, ...query } = route.query;
  let email = '';

  if (token && typeof token === 'string' && token.includes('.')) {
    try {
      const [_, payloadBase64] = token.split('.');
      if (payloadBase64) {
        const payload = JSON.parse(Base64.decode(payloadBase64));
        email = payload.email;
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  if (!email) {
    goToLogin();
    return;
  }

  await accountStore.loginChangeEmail(token as string, email);
  if (loginChangeEmailError.value) return;
  await router.replace({ query });
  accountStore.guestEmail = email;
});
</script>
