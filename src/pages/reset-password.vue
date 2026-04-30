<template>
  <div class="layout-frame">
    <PageTitle :title="t('resetPassword.title')" />
    <ResetPasswordForm />
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';

import PageTitle from '@generics/PageTitle.vue';
import ResetPasswordForm from '@modules/Forms/ResetPasswordForm.vue';

definePage({
  name: 'ResetPassword',
  meta: {
    bgColor: 'white',
  },
  beforeEnter: (to, _, next) => (!to.query.token ? next({ name: 'Home' }) : next()),
});

const { t } = useTranslation();
</script>
