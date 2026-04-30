<template>
  <Dialog :open="isOpen">
    <DialogContent class="max-h-screen overflow-scroll bg-white sm:max-w-[500px]" hideClose>
      <DialogHeader>
        <DialogTitle class="mb-2">{{ t('missingDetails.title') }}</DialogTitle>
        <DialogDescription>{{ t('missingDetails.description') }}</DialogDescription>
      </DialogHeader>
      <UserDetailsForm
        formName="missingDetailsForm"
        class="!mb-0 !mt-0 w-full max-w-md pb-0"
        :collectFields="collectFields"
        :requiredFields="requiredFields"
        :initialValues="fanData"
        emailDisabled
        :error="fanPatchError"
        :success="fanPatchData ? t('profile.success') : undefined"
        :isSubmitting="isSubmitting"
        :isLoading="isFanFetching"
        @clearError="clearError"
        @clearSuccess="clearSuccess"
        @submit="onSubmit"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { storeToRefs } from 'pinia';
import { useFanStore } from '@stores/fan.store';
import { type FanUpdateData } from '@/api/fan.api';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui/dialog';
import UserDetailsForm from '@modules/Forms/UserDetailsForm.vue';

defineProps<{
  isOpen: boolean;
}>();

const { t } = useTranslation();
const fanStore = useFanStore();
const { fanData, fanPatchData, fanPatchError, isFanFetching } = storeToRefs(fanStore);
const isSubmitting = ref(false);

const collectFields = computed(() => ({
  firstName: !fanData?.value?.firstName,
  lastName: !fanData?.value?.lastName,
  email: !fanData?.value?.email,
  phoneNumber: !fanData?.value?.phoneNumber,
  birthDate: !fanData?.value?.birthDate,
}));
const requiredFields = computed(() => fanStore.getRequiredFields());

const onSubmit = async (formData: FanUpdateData) => {
  isSubmitting.value = true;
  await fanStore.fanPatch(formData);
  if (fanPatchError.value) return;
  isSubmitting.value = false;
};
const clearError = () => (fanPatchError.value = null);
const clearSuccess = () => (fanPatchData.value = null);
</script>
