<template>
  <form
    class="form-wrapper"
    name="magic-link-form"
    data-form-type="magic-link"
    @submit.prevent="onSubmit"
  >
    <InputWrapped
      :label="t('input.label.email')"
      :placeholder="t('input.label.email')"
      name="email"
      v-model="email"
      v-bind="emailAttrs"
      :error="errors.email"
      autocomplete="username"
      :disabled="isSendMagicLinkFetching"
    />
    <Button type="submit" :disabled="isSendMagicLinkFetching">
      <Loader2 v-if="isSendMagicLinkFetching" class="mr-2 h-4 w-4 animate-spin stroke-white" />
      {{ t('common.sendMagicLink') }}
    </Button>
    <InfoBar
      v-if="sendMagicLinkError"
      variant="destructive"
      :title="t('common.error')"
      :message="sendMagicLinkError"
      @close="sendMagicLinkError = null"
    />
    <InfoBar
      v-if="sendMagicLinkData"
      variant="success"
      :title="t('common.success')"
      :message="sendMagicLinkData?.message"
      @close="sendMagicLinkData = null"
    />
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import { watch } from 'vue';
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
const { sendMagicLinkData, sendMagicLinkError, isSendMagicLinkFetching } =
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
  accountStore.sendMagicLink(values.email);
});

watch(email, (newValue) => {
  if (newValue !== accountStore.guestEmail) {
    accountStore.guestEmail = newValue || '';
  }
});

watch(
  values,
  () => {
    sendMagicLinkError.value = null;
    sendMagicLinkData.value = null;
  },
  { deep: true },
);
</script>
