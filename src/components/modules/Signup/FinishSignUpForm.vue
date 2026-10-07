<template>
  <UserDetailsForm
    formName="finishSignUpForm"
    :initialValues="fanData"
    emailDisabled
    :collectFields="collectFields"
    :requiredFields="requiredFields"
    :submitButtonText="isFanPatchFetching ? t('common.submitting') : t('common.continue')"
    :error="fanPatchError"
    :isSubmitting="isFanPatchFetching"
    @submit="(data) => fanStore.fanPatch(data)"
    @clearError="fanPatchError = null"
  />
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';
import { useFanStore } from '@stores/fan.store';
import { storeToRefs } from 'pinia';

import { type CollectFields } from '@/api/fan.api';
import UserDetailsForm from '@modules/Forms/UserDetailsForm.vue';

const collectFields: CollectFields = {
  firstName: true,
  lastName: true,
  email: true,
  location: true,
  username: true,
  phoneNumber: true,
  birthDate: true,
  consentMessaging: true,
};

const { t } = useTranslation();
const fanStore = useFanStore();
const { fanPatchError, fanData, isFanPatchFetching } = storeToRefs(fanStore);
const requiredFields = fanStore.getRequiredFields();
</script>
