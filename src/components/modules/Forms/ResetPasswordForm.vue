<template>
  <InfoBar
    v-if="loginChangePasswordData"
    variant="success"
    :title="t('common.success')"
    :message="t('common.passwordResetSuccessfully')"
  />
  <form
    v-else
    class="form-wrapper"
    name="reset-password-form"
    data-form-type="reset-password"
    @submit.prevent="onSubmit"
  >
    <InputWrapped
      :label="t('input.label.newPassword')"
      :placeholder="t('input.label.newPassword')"
      name="password"
      type="password"
      v-model="password"
      v-bind="passwordAttrs"
      :error="errors.password"
      autocomplete="new-password"
      :disabled="isLoginChangePasswordFetching"
    />
    <InputWrapped
      :label="t('input.label.retypePassword')"
      :placeholder="t('input.label.retypePassword')"
      name="retypePassword"
      type="password"
      v-model="retypePassword"
      v-bind="retypePasswordAttrs"
      :error="errors.retypePassword"
      autocomplete="new-password"
      :disabled="isLoginChangePasswordFetching"
    />
    <Button
      type="submit"
      :loading="isLoginChangePasswordFetching"
      :disabled="isLoginChangePasswordFetching"
    >
      <Loader2
        v-if="isLoginChangePasswordFetching"
        class="mr-2 h-4 w-4 animate-spin stroke-white"
      />
      {{ t('common.resetPassword') }}
    </Button>
    <InfoBar
      v-if="loginChangePasswordError"
      variant="destructive"
      :title="t('common.error')"
      :message="loginChangePasswordError"
      @close="loginChangePasswordError = null"
    />
  </form>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useAccountStore } from '@stores/account.store';
import { storeToRefs } from 'pinia';
import { useTranslation } from '@/locales/i18n';

import { Loader2 } from 'lucide-vue-next';
import InfoBar from '@generics/InfoBar.vue';
import InputWrapped from '@modules/Inputs/InputWrapped/InputWrapped.vue';
import Button from '@ui/button/Button.vue';

const { t } = useTranslation();
const router = useRouter();
const accountStore = useAccountStore();
const { loginChangePasswordData, loginChangePasswordError, isLoginChangePasswordFetching } =
  storeToRefs(accountStore);
const schema = toTypedSchema(
  z
    .object({
      password: z.string().min(1, t('errors.required')).min(8, t('errors.passwordMinLengthNotMet')),
      retypePassword: z.string().min(1, t('errors.required')),
    })
    .refine((data) => data.password === data.retypePassword, {
      message: t('errors.passwordsMustMatch'),
      path: ['retypePassword'],
    }),
);
const { errors, handleSubmit, defineField, values } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    password: '',
    retypePassword: '',
  },
});

const [password, passwordAttrs] = defineField('password', {
  validateOnModelUpdate: false,
});
const [retypePassword, retypePasswordAttrs] = defineField('retypePassword', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});

const onSubmit = handleSubmit(async (values) => {
  await accountStore.loginChangePassword(values.password);
  if (loginChangePasswordError.value) {
    return;
  }
  setTimeout(() => {
    router.push({ name: 'Login', query: { method: 'password' } });
  }, 3000);
});

watch(
  values,
  () => {
    loginChangePasswordError.value = null;
    loginChangePasswordData.value = null;
  },
  { deep: true },
);
</script>
