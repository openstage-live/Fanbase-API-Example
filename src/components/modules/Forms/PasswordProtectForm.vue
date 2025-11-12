<template>
  <div>
    <div class="mb-4 flex flex-col items-center gap-3">
      <Lock class="mb-3 h-8 w-8 stroke-black" />
      <h1 class="mb-4 text-center text-base font-light leading-5 text-black">
        {{ t('passwordProtect.title') }}
      </h1>
    </div>
    <form
      @submit.prevent="onSubmit"
      class="form-wrapper"
      name="access-code-form"
      data-form-type="access-code"
    >
      <input
        id="site-access-username"
        name="username"
        type="text"
        v-model="fauxUsernameForPasswordManager"
        autocomplete="username"
        readonly
        style="position: absolute; left: -9999px; opacity: 0; pointer-events: none"
        tabindex="-1"
      />
      <InputWrapped
        name="accessCode"
        :label="t('input.label.accessCode')"
        :placeholder="t('input.label.accessCode')"
        type="password"
        v-model="password"
        v-bind="passwordAttrs"
        :error="errors.accessCode"
        autocomplete="password"
        id="accessCode"
      />
      <Button type="submit"> {{ t('common.submit') }} </Button>
      <InfoBar
        v-if="error"
        variant="destructive"
        :title="t('common.error')"
        :message="error"
        @close="error = ''"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useForm } from 'vee-validate';
import { useCookies } from '@vueuse/integrations/useCookies';
import { useTranslation } from '@/locales/i18n';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { Lock } from 'lucide-vue-next';
import InfoBar from '@generics/InfoBar.vue';
import Button from '@ui/button/Button.vue';
import InputWrapped from '@modules/Inputs/InputWrapped/InputWrapped.vue';
import { env } from '@/env';

const { t } = useTranslation();

const cookies = useCookies(['stored-password']);

const schema = toTypedSchema(
  z.object({
    accessCode: z.string().min(1, t('errors.required')),
  }),
);

const { errors, handleSubmit, defineField, values } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    accessCode: '',
  },
});

const [password, passwordAttrs] = defineField('accessCode', {
  validateOnModelUpdate: false,
  validateOnBlur: false,
  validateOnChange: false,
});

const error = ref('');

const fauxUsernameForPasswordManager = ref('Access Code');

const onSubmit = handleSubmit((values) => {
  if (values.accessCode === env.VITE_FF_PASSWORD) {
    cookies.set('stored-password', values.accessCode, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  } else {
    if (cookies.get('stored-password')) {
      cookies.remove('stored-password');
    }
    password.value = '';
    nextTick(() => {
      error.value = t('errors.incorrectAccessCode');
    });
  }
});

watch(values, () => (error.value = ''), { deep: true });
</script>
