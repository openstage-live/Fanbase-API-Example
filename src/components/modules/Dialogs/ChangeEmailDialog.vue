<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogTrigger as-child>
      <div @click="onOpenChange(true)">
        <EditButton class="absolute right-2 top-0" />
      </div>
    </DialogTrigger>
    <DialogContent class="max-h-screen overflow-scroll bg-white sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="mb-1 font-Matter-Bold text-2xl uppercase">{{
          t('input.changeEmail.title')
        }}</DialogTitle>
        <DialogDescription class="text-balance">{{
          t('input.changeEmail.description')
        }}</DialogDescription>
      </DialogHeader>
      <form
        class="form-wrapper"
        name="change-email-form"
        data-form-type="change-email"
        @submit.prevent="onSubmit"
      >
        <InputWrapped
          v-model="newEmail"
          :placeholder="t('input.label.newEmail')"
          :label="t('input.label.newEmail')"
          name="newEmail"
          type="email"
          v-bind="newEmailAttrs"
          :error="errors.newEmail"
          :disabled="isSendChangeEmailFetching"
        />
        <InputWrapped
          v-model="newEmailAgain"
          :placeholder="t('input.label.newEmailAgain')"
          :label="t('input.label.newEmailAgain')"
          name="newEmailAgain"
          type="email"
          v-bind="newEmailAgainAttrs"
          :error="errors.newEmailAgain"
          :disabled="isSendChangeEmailFetching"
        />
        <Button
          type="submit"
          :disabled="isSendChangeEmailFetching"
          :loading="isSendChangeEmailFetching"
          class="w-full"
        >
          <Loader2
            v-if="isSendChangeEmailFetching"
            class="mr-2 h-4 w-4 animate-spin stroke-white"
          />
          {{ t('input.changeEmail.buttonLabel') }}
        </Button>
        <InfoBar
          v-if="sendChangeEmailError"
          variant="destructive"
          :title="t('common.error')"
          :message="sendChangeEmailError || t('common.tryAgain')"
          @close="sendChangeEmailError = null"
        />
        <InfoBar
          v-if="sendChangeEmailData"
          variant="success"
          :title="t('common.success')"
          :message="sendChangeEmailData?.message || t('common.success')"
          @close="sendChangeEmailData = null"
        />
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@ui/dialog';
import Button from '@ui/button/Button.vue';
import InputWrapped from '@modules/Inputs/InputWrapped/InputWrapped.vue';
import EditButton from '@generics/Buttons/EditButton.vue';
import { Loader2 } from 'lucide-vue-next';
import InfoBar from '@generics/InfoBar.vue';
import { useAccountStore } from '@stores/account.store';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { type LabelVariants } from '@ui/label/index';

const props = defineProps<{
  disabled?: boolean;
  variant?: LabelVariants['variant'];
}>();

const isOpen = defineModel<boolean>('modelValue', {
  required: true,
});

const { t } = useTranslation();
const accountStore = useAccountStore();
const { sendChangeEmailData, sendChangeEmailError, isSendChangeEmailFetching } =
  storeToRefs(accountStore);

const schema = toTypedSchema(
  z
    .object({
      newEmail: z.email({
        error: (iss) => (!iss.input ? t('errors.required') : t('errors.invalidEmail')),
      }),
      newEmailAgain: z.string().min(1, t('errors.required')),
    })
    .refine((data) => data.newEmail === data.newEmailAgain, {
      message: t('errors.emailsMustMatch'),
      path: ['newEmailAgain'],
    }),
);

const { errors, handleSubmit, defineField, values } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    newEmail: '',
    newEmailAgain: '',
  },
});
const [newEmail, newEmailAttrs] = defineField('newEmail', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [newEmailAgain, newEmailAgainAttrs] = defineField('newEmailAgain', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});

const onOpenChange = (open: boolean) => {
  if (props.disabled) return;
  if (isSendChangeEmailFetching.value && isOpen.value) return;
  isOpen.value = open;
};

const onSubmit = handleSubmit((values) => {
  if (props.disabled) return;
  accountStore.sendChangeEmail(values.newEmail);
});

watch(
  values,
  () => {
    sendChangeEmailError.value = null;
    sendChangeEmailData.value = null;
  },
  { deep: true },
);
</script>
