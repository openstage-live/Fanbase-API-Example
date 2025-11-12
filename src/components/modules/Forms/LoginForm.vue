<template>
  <form class="form-wrapper" name="login-form" data-form-type="login" @submit.prevent="onSubmit">
    <InputWrapped
      name="email"
      :label="t('input.label.email')"
      :placeholder="t('input.label.email')"
      type="email"
      v-model="email"
      v-bind="emailAttrs"
      :error="errors.email"
      autocomplete="username"
      :disabled="isLoginFanFetching"
    />
    <InputWrapped
      name="password"
      :label="t('input.label.password')"
      :placeholder="t('input.label.password')"
      type="password"
      v-model="password"
      v-bind="passwordAttrs"
      :error="errors.password"
      autocomplete="current-password"
      :disabled="isLoginFanFetching"
    />
    <Button type="submit" :disabled="isLoginFanFetching">
      <Loader2 v-if="isLoginFanFetching" class="h-4 w-4 animate-spin stroke-white" />
      {{ isLoginFanFetching ? t('common.signingIn') : t('common.signIn') }}
    </Button>
    <InfoBar
      v-if="loginFanError"
      variant="destructive"
      :title="t('common.error')"
      :message="loginFanError"
      @close="loginFanError = null"
    />
  </form>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { useAccountStore } from '@stores/account.store';
import { storeToRefs } from 'pinia';
import { useTranslation } from '@/locales/i18n';

import { Loader2 } from 'lucide-vue-next';
import InputWrapped from '@modules/Inputs/InputWrapped/InputWrapped.vue';
import Button from '@ui/button/Button.vue';
import InfoBar from '@generics/InfoBar.vue';

const { t } = useTranslation();

const accountStore = useAccountStore();
const { loginFanError, isLoginFanFetching, guestEmail } = storeToRefs(accountStore);

const schema = toTypedSchema(
  z.object({
    email: z.email({
      error: (iss) => (!iss.input ? t('errors.required') : t('errors.invalidEmail')),
    }),
    password: z.string().min(1, t('errors.required')),
  }),
);

const { errors, handleSubmit, defineField, values } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    email: guestEmail.value,
    password: '',
  },
});
const [email, emailAttrs] = defineField('email', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});

watch(email, (newValue) => {
  if (newValue !== guestEmail.value) {
    guestEmail.value = newValue || '';
  }
});

const [password, passwordAttrs] = defineField('password', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});

const onSubmit = handleSubmit(async (values) => {
  // Get friend ID from localStorage if it exists (for referral tracking)
  const friendId = localStorage.getItem('friendId') || undefined;

  // Attempt to log in the user with email, password, and optional friend ID
  await accountStore.loginFan(values.email, values.password, friendId);

  // Clean up friend ID from localStorage after login attempt
  localStorage.removeItem('friendId');
});

onBeforeUnmount(() => {
  password.value = '';
});

watch(
  values,
  () => {
    loginFanError.value = null;
  },
  { deep: true },
);
</script>
