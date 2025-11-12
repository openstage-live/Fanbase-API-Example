<template>
  <div class="layout-frame">
    <PageTitle :title="t('forgotPassword.title')" :subtitle="t('forgotPassword.subtitle')" />
    <ForgotPasswordForm />
    <SignUpLink />
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';
import ForgotPasswordForm from '@modules/Forms/ForgotPasswordForm.vue';
import PageTitle from '@generics/PageTitle.vue';
import SignUpLink from '@generics/SignUpLink.vue';

definePage({
  name: 'ForgotPassword',
  meta: {
    bgColor: 'white',
  },
});

const { t } = useTranslation();
</script>
