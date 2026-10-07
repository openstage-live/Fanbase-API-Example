<template>
  <div class="layout-frame">
    <ThankYou v-if="isSignedUp" :fanEmail="fanEmail" @restartSignup="restartSignup" />
    <template v-else>
      <PageTitle
        :title="
          showPayment
            ? t('signUp.youAreAlmostThere')
            : isAuthenticated && !hasMissingFields && hasLiveTiers && !fanSubscriptionId
              ? t('signUp.chooseYourMembership')
              : t('signUp.title')
        "
      />
      <StepIndicator v-if="!showPayment && hasLiveTiers" :steps="signupSteps" />
      <FinishSignUpForm v-if="isAuthenticated && hasMissingFields" />
      <MembershipSelection
        v-else-if="isAuthenticated && hasLiveTiers"
        @showPaymentChange="showPayment = $event"
      />
      <LoadingSection v-else-if="isSignUpFetching || tokenInQuery" :isLoading="true" />
      <template v-else>
        <InfoBar
          v-if="signUpError"
          variant="destructive"
          :title="t('common.error')"
          :message="signUpError"
          @close="signUpError = null"
        />
        <SignUpForm @success="handleSuccess" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTranslation } from '@/locales/i18n';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import { useFanStore } from '@stores/fan.store';
import { useTierStore } from '@stores/tier.store';
import { useFanTracking } from '@composables/useFanTracking';

import InfoBar from '@generics/InfoBar.vue';
import LoadingSection from '@generics/LoadingSection.vue';
import PageTitle from '@generics/PageTitle.vue';
import FinishSignUpForm from '@modules/Signup/FinishSignUpForm.vue';
import MembershipSelection from '@modules/Memberships/MembershipSelection.vue';
import SignUpForm from '@modules/Signup/SignUpForm.vue';
import StepIndicator from '@modules/Signup/StepIndicator.vue';
import ThankYou from '@modules/Signup/ThankYou.vue';

definePage({
  name: 'SignUp',
  meta: {
    public: true,
    bgColor: 'white',
  },
  beforeEnter: (_, __, next) =>
    useAccountStore().isMember ||
    (useAccountStore().isAuthenticated && !useTierStore().hasLiveTiers)
      ? next({ name: 'Home' })
      : next(),
});

const { t } = useTranslation();
const accountStore = useAccountStore();
const {
  tokenInQuery,
  isAuthenticated,
  sendSignUpData,
  sendSignUpError,
  signUpError,
  isSignUpFetching,
} = storeToRefs(accountStore);
const fanStore = useFanStore();
const { fanSubscriptionId, hasMissingFields, isFanFetching } = storeToRefs(fanStore);
const tierStore = useTierStore();
const { hasLiveTiers } = storeToRefs(tierStore);
const route = useRoute();
const router = useRouter();
const fanTracking = useFanTracking();

const showPayment = ref(false);
const isSignedUp = ref(false);
const fanEmail = ref<string>('');

const signupSteps = computed(() => [
  {
    title: t('signUp.steps.account.title'),
    description: t('signUp.steps.account.description'),
    active: !isAuthenticated.value || !!hasMissingFields.value,
  },
  {
    title: t('signUp.steps.membership.title'),
    description: t('signUp.steps.membership.description'),
    active: isAuthenticated.value && !hasMissingFields.value,
  },
]);

const restartSignup = () => {
  isSignedUp.value = false;
  fanEmail.value = '';
};

const handleSuccess = (email: string | null) => {
  fanTracking.trackSignupRequested();
  sendSignUpData.value = null;
  sendSignUpError.value = null;
  fanEmail.value = email || '';
  isSignedUp.value = true;
};

onMounted(async () => {
  if (!tokenInQuery.value) return;

  if (!isAuthenticated.value) {
    const friendId = localStorage.getItem('friendId') || undefined;
    await accountStore.signUp(friendId);
    if (!signUpError.value) {
      localStorage.removeItem('friendId');
      fanTracking.trackSignupSubmitted(friendId);
    }
  }

  const { token: _, ...query } = route.query;
  router.replace({ query });
});

watch(
  () =>
    isAuthenticated.value &&
    !isFanFetching.value &&
    !hasMissingFields.value &&
    (!!fanSubscriptionId.value || !hasLiveTiers.value),
  (isDone) => {
    if (isDone) router.push({ name: 'Home' }).catch(console.error);
  },
  { immediate: true },
);
</script>
