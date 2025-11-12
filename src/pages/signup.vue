<template>
  <div class="layout-frame">
    <ThankYou v-if="isSignedUp" :fanEmail="fanEmail" @restartSignup="restartSignup" />
    <template v-else>
      <PageTitle
        :title="
          showPayment
            ? t('signUp.youAreAlmostThere')
            : isAuthenticated && hasLiveTiers && !fanSubscriptionId
              ? t('signUp.chooseYourMembership')
              : t('signUp.title')
        "
      />
      <StepIndicator v-if="!showPayment && hasLiveTiers" :steps="signupSteps" />
      <FinishSignUpForm v-if="tokenInQuery && !isAuthenticated" />
      <MembershipSelection
        v-else-if="isAuthenticated && hasLiveTiers"
        @showPaymentChange="showPayment = $event"
      />
      <SignUpForm v-else @success="handleSuccess" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTranslation } from '@/locales/i18n';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import { useFanStore } from '@stores/fan.store';
import { useTierStore } from '@stores/tier.store';
import { useFanTracking } from '@composables/useFanTracking';

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
const { tokenInQuery, isAuthenticated, sendSignUpData, sendSignUpError } =
  storeToRefs(accountStore);
const fanStore = useFanStore();
const { fanSubscriptionId } = storeToRefs(fanStore);
const tierStore = useTierStore();
const { hasLiveTiers } = storeToRefs(tierStore);
const router = useRouter();
const fanTracking = useFanTracking();

const showPayment = ref(false);
const isSignedUp = ref(false);
const fanEmail = ref<string>('');

const signupSteps = computed(() => [
  {
    title: t('signUp.steps.account.title'),
    description: t('signUp.steps.account.description'),
    active: !isAuthenticated.value,
  },
  {
    title: t('signUp.steps.membership.title'),
    description: t('signUp.steps.membership.description'),
    active: isAuthenticated.value,
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

watch(
  fanSubscriptionId,
  (newVal) => {
    if (isAuthenticated.value && newVal) {
      router.push({ name: 'Home' }).catch(console.error);
    }
  },
  { immediate: true },
);
</script>
