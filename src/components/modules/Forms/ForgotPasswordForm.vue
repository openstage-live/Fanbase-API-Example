<template>
  <form
    class="form-wrapper"
    name="forgot-password-form"
    data-form-type="forgot-password"
    @submit.prevent="onSubmit"
  >
    <InputWrapped
      name="email"
      :label="t('input.label.email')"
      :placeholder="t('input.label.email')"
      v-model="email"
      v-bind="emailAttrs"
      :error="errors.email"
      autocomplete="username"
      :disabled="isSendForgotPasswordFetching"
    />
    <Button type="submit" :disabled="isSendForgotPasswordFetching">
      <Loader2 v-if="isSendForgotPasswordFetching" class="mr-2 h-4 w-4 animate-spin stroke-white" />
      {{ t('forgotPassword.buttonLabel') }}
    </Button>
    <InfoBar
      v-if="sendForgotPasswordError"
      variant="destructive"
      :title="t('common.error')"
      :message="sendForgotPasswordError"
      @close="sendForgotPasswordError = null"
    />
    <InfoBar
      v-if="sendForgotPasswordData?.message"
      variant="success"
      :title="t('common.success')"
      :message="sendForgotPasswordData?.message"
      @close="sendForgotPasswordData = null"
    />
  </form>
</template>

<script setup lang="ts">
import { watch } from 'vue';
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

const accountStore = useAccountStore();
const { sendForgotPasswordData, sendForgotPasswordError, isSendForgotPasswordFetching } =
  storeToRefs(accountStore);
const schema = toTypedSchema(
  z.object({
    email: z.email({
      error: (iss) => (!iss.input ? t('errors.required') : t('errors.invalidEmail')),
    }),
  }),
);
const { errors, handleSubmit, defineField, values } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    email: accountStore.guestEmail || '',
  },
});

const [email, emailAttrs] = defineField('email', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});

const onSubmit = handleSubmit((values) => {
  accountStore.sendForgotPassword(values.email);
});

watch(email, (newValue) => {
  if (newValue !== accountStore.guestEmail) {
    accountStore.guestEmail = newValue || '';
  }
});

watch(
  values,
  () => {
    sendForgotPasswordError.value = null;
    sendForgotPasswordData.value = null;
  },
  { deep: true },
);
</script>
