<template>
  <div>
    <InfoBar
      v-if="tokenError"
      variant="destructive"
      :title="t('common.error')"
      :message="tokenError"
      @close="tokenError = null"
    />
    <UserDetailsForm
      v-else
      formName="finishSignUpForm"
      :initialValues="initialValues"
      emailDisabled
      :collectFields="collectFields"
      :requiredFields="requiredFields"
      :submitButtonText="isSubmitting ? t('common.submitting') : t('common.signUp')"
      :error="errorMessage"
      :isSubmitting="isSubmitting"
      @submit="onSubmit"
      @clearError="clearError"
      @clearSuccess="clearSuccess"
    >
      <template #form-footer>
        <div
          class="mt-4 text-center text-xs text-foreground/50"
          v-html="t('dynamic.termsGeneral')"
        ></div>
      </template>
    </UserDetailsForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTranslation } from '@/locales/i18n';
import { useRoute, useRouter } from 'vue-router';
import { Base64 } from 'js-base64';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@composables/useFanTracking';
import { useAccountStore } from '@stores/account.store';
import { useTierStore } from '@stores/tier.store';
import { storeToRefs } from 'pinia';

import { type CollectFields, type FanUpdateData } from '@/api/fan.api';
import UserDetailsForm from '@modules/Forms/UserDetailsForm.vue';
import InfoBar from '@generics/InfoBar.vue';

const collectFields: CollectFields = {
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  location: true,
  username: true,
  phoneNumber: true,
  birthDate: true,
  consentEmail: true,
  consentSms: true,
};

const { t } = useTranslation();
const fanStore = useFanStore();
const accountStore = useAccountStore();
const tierStore = useTierStore();
const { hasLiveTiers } = storeToRefs(tierStore);
const { fanPatchError, fanData } = storeToRefs(fanStore);
const { signUpData, signUpError, loginFanError, tokenInQuery } = storeToRefs(accountStore);
const route = useRoute();
const router = useRouter();
const fanTracking = useFanTracking();

const isSubmitting = ref(false);

const requiredFields = computed(() => fanStore.getRequiredFields(true, true));
const tokenError = computed(() => {
  const token = tokenInQuery.value;
  if (!token) {
    return null;
  }

  try {
    if (!token.includes('.')) {
      return t('errors.invalidToken');
    }

    const [_, queryTokenBase64] = token.split('.');
    if (!queryTokenBase64) {
      return t('errors.invalidToken');
    }

    const queryTokenPayload = JSON.parse(Base64.decode(queryTokenBase64));
    if (!queryTokenPayload?.email || queryTokenPayload?.role !== 'signup') {
      return t('errors.invalidToken');
    }

    return null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return t('errors.invalidToken');
  }
});

const fanEmail = computed(() => {
  if (!tokenInQuery.value) return fanData.value?.email;

  try {
    const [, queryTokenBase64] = tokenInQuery.value.split('.');
    const queryTokenPayload = JSON.parse(Base64.decode(queryTokenBase64 ?? ''));
    return queryTokenPayload?.email;
  } catch {
    return null;
  }
});

const initialValues = computed(() => ({
  email: fanEmail.value || null,
}));

const errorMessage = computed(
  () => signUpError.value || fanPatchError.value || loginFanError.value || '',
);

const clearError = () => {
  signUpError.value = null;
  fanPatchError.value = null;
  loginFanError.value = null;
};

const clearSuccess = () => {
  signUpData.value = null;
};

const onSubmit = async (
  formData: FanUpdateData,
  signupData: { email?: string; password?: string },
) => {
  if (tokenError.value || !signupData.password || !signupData.email) return;

  isSubmitting.value = true;

  try {
    const friendId = localStorage.getItem('friendId') || undefined;
    if (friendId) {
      await accountStore.signUp(signupData.password, friendId);
      localStorage.removeItem('friendId');
    } else {
      await accountStore.signUp(signupData.password);
    }
    if (signUpError.value || !signUpData.value) return;

    const { token: fanAuthToken } = signUpData.value;
    await fanStore.fanPatch(formData, fanAuthToken);
    if (fanPatchError.value) return;

    accountStore.setAuthToken(fanAuthToken);
    fanTracking.trackSignupSubmitted(friendId);
    const { token: _, ...query } = route.query;
    router.replace({ query });
    if (!hasLiveTiers.value) {
      router.push({ name: 'Home' });
    }
  } catch (error) {
    console.error('Error', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
