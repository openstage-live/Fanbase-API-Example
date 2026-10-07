<template>
  <form class="form-wrapper" name="signup-form" data-form-type="signup" @submit.prevent="onSubmit">
    <InputWrapped
      name="email"
      type="email"
      v-model="email"
      v-bind="emailAttrs"
      autocomplete="username"
      :label="t('input.label.email')"
      :placeholder="t('input.label.email')"
      :error="errors.email"
      :disabled="isSendSignUpFetching"
      :validation-rules="'required|email'"
    />
    <Button type="submit" :loading="isSendSignUpFetching" :disabled="isSendSignUpFetching">
      <Loader2 v-if="isSendSignUpFetching" class="h-4 w-4 animate-spin stroke-white" />
      {{ isSendSignUpFetching ? t('common.signingUp') : t('common.signUp') }}
    </Button>
    <InfoBar
      v-if="sendSignUpError"
      variant="destructive"
      :title="t('common.error')"
      :message="sendSignUpError"
      @close="sendSignUpError = null"
    />
    <div
      class="text-center text-xs text-foreground/50"
      v-html="t('dynamic.termsSignup', { artistName: artistStore.name })"
    ></div>
    <SignInLink />
  </form>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useTranslation } from '@/locales/i18n';
import { useAccountStore } from '@stores/account.store';
import { useArtistStore } from '@stores/artist.store';
import { storeToRefs } from 'pinia';

import { Loader2 } from 'lucide-vue-next';
import Button from '@ui/button/Button.vue';
import InfoBar from '@generics/InfoBar.vue';
import SignInLink from '@generics/SignInLink.vue';
import InputWrapped from '@modules/Inputs/InputWrapped/InputWrapped.vue';

const emit = defineEmits<{
  (e: 'success', email: string | null): void;
}>();

const { t } = useTranslation();
const accountStore = useAccountStore();
const artistStore = useArtistStore();
const { sendSignUpData, sendSignUpError, isSendSignUpFetching } = storeToRefs(accountStore);

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

const onSubmit = handleSubmit(async (values) => {
  await accountStore.sendSignUp(values.email);
  if (sendSignUpError.value) return;
  emit('success', values.email || null);
});

onMounted(accountStore.preloadCaptcha);

watch(email, (newValue) => {
  if (newValue !== accountStore.guestEmail) {
    accountStore.guestEmail = newValue || '';
  }
});

watch(
  values,
  () => {
    sendSignUpError.value = null;
    sendSignUpData.value = null;
  },
  { deep: true },
);
</script>
