import type { Fan } from '@/api/fan.api';
import type { RouteNamedMap } from 'vue-router/auto-routes';
import { computed, nextTick, ref } from 'vue';
import { defineStore } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useCookies } from '@vueuse/integrations/useCookies';
import { useFanStore } from '@stores/fan.store';
import { useFanTracking } from '@/composables/useFanTracking';
import { postTelemetry } from '@/api/tracking.api';
import { useStorage } from '@vueuse/core';
import { useApiFetcher } from '@/composables/useApiFetcher';
import {
  login,
  magicLink,
  changePassword,
  changeEmail,
  signupConfirm,
  sendChangeEmail as sendChangeEmailApi,
  sendForgotPassword as sendForgotPasswordApi,
  sendMagicLink as sendMagicLinkApi,
  signupStart,
  type SignupStartResponse,
  type EmailResponse,
  type ChangeDetailsResponse,
} from '@/api/account.api';
import { getFan } from '@/api/fan.api';
import { useArtistStore } from '@stores/artist.store';
import { useZatapStore } from './zatap.store';
import { useReCaptcha } from '@/composables/useReCaptcha';
import { useTranslation } from '@/locales/i18n';

export const useAccountStore = defineStore('account', () => {
  const router = useRouter();
  const route = useRoute();
  const cookies = useCookies(['f_uauth', 'f_subscription_id']);
  const { setUserIdInGTM, trackFanLogout } = useFanTracking();

  const artistStore = useArtistStore();
  const fanStore = useFanStore();
  const zatapStore = useZatapStore();
  const reCaptcha = useReCaptcha();
  const { t } = useTranslation();

  const guestEmail = useStorage('emailFromQuery', '', sessionStorage);

  const authToken = ref<string | undefined>(undefined);
  const subscriptionId = ref<string | undefined>(undefined);
  const isAuthenticated = computed(() => !!authToken.value);
  const isMember = computed(() => !!subscriptionId.value);
  const tokenInQuery = computed(() => route.query?.token as string);
  const friendIdInQuery = computed(() => route.query?.friendId as string);

  // API Fetchers
  const {
    data: loginFanData,
    error: loginFanError,
    isFetching: isLoginFanFetching,
    execute: executeLoginFan,
    reset: resetLoginFan,
  } = useApiFetcher<Fan | null>(null, {
    successCallback: handleLoginSuccess,
  });

  const {
    data: loginMagicLinkData,
    error: loginMagicLinkError,
    isFetching: isLoginMagicLinkFetching,
    execute: executeLoginMagicLink,
    reset: resetLoginMagicLink,
  } = useApiFetcher<Fan | null>(null, {
    successCallback: handleLoginSuccess,
  });

  const {
    data: sendSignUpData,
    error: sendSignUpError,
    isFetching: isSendSignUpFetching,
    execute: executeSendSignUp,
  } = useApiFetcher<SignupStartResponse | null>(null);

  const {
    data: signUpData,
    error: signUpError,
    isFetching: isSignUpFetching,
    execute: executeSignUp,
  } = useApiFetcher<Fan | null>(null, {
    successCallback: (data) => {
      if (!data) return;
      setAuthToken(data.token);
      setSubscriptionId(data.subscriptionId);
      setUserIdInGTM(data.id);
      fanStore.setFanGetFetcherData(data);
      postTelemetry({
        metric: 'signup',
        resource: window.location.href,
      });
      zatapStore.recordTagTelemetry();
    },
  });

  const {
    data: sendChangeEmailData,
    error: sendChangeEmailError,
    isFetching: isSendChangeEmailFetching,
    execute: executeSendChangeEmail,
  } = useApiFetcher<EmailResponse | null>(null);

  const {
    data: loginChangeEmailData,
    error: loginChangeEmailError,
    isFetching: isLoginChangeEmailFetching,
    execute: executeLoginChangeEmail,
  } = useApiFetcher<ChangeDetailsResponse | null>(null);

  const {
    data: sendForgotPasswordData,
    error: sendForgotPasswordError,
    isFetching: isSendForgotPasswordFetching,
    execute: executeSendForgotPassword,
  } = useApiFetcher<EmailResponse | null>(null);

  const {
    data: loginChangePasswordData,
    error: loginChangePasswordError,
    isFetching: isLoginChangePasswordFetching,
    execute: executeLoginChangePassword,
  } = useApiFetcher<ChangeDetailsResponse | null>(null);

  const {
    data: sendMagicLinkData,
    error: sendMagicLinkError,
    isFetching: isSendMagicLinkFetching,
    execute: executeSendMagicLink,
  } = useApiFetcher<EmailResponse | null>(null);

  const initializeAuthState = () => {
    authToken.value = cookies.get('f_uauth') || undefined;
    subscriptionId.value = cookies.get('f_subscription_id') || undefined;
  };
  const setAuthToken = (token: string) => {
    cookies.set('f_uauth', token, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    authToken.value = token;
  };
  const setSubscriptionId = (id?: string) => {
    if (!id) {
      cookies.remove('f_subscription_id', { path: '/' });
      subscriptionId.value = undefined;
      return;
    }
    cookies.set('f_subscription_id', id, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    subscriptionId.value = id;
  };

  // Actions
  const loginFan = async (email: string, password: string, friendId?: string) => {
    await executeLoginFan((signal) =>
      login({ email, password, friendId, artistId: artistStore.id }, signal),
    );
  };

  const loginMagicLink = async (token: string, friendId?: string) => {
    await executeLoginMagicLink((signal) =>
      magicLink({ token, friendId, artistId: artistStore.id }, token, signal),
    );
  };

  function handleLoginSuccess(data: Fan | null) {
    if (!data) return;

    setAuthToken(data.token);
    setSubscriptionId(data.subscriptionId);
    setUserIdInGTM(data.id);
    fanStore.setFanGetFetcherData(data);
    zatapStore.recordTagTelemetry();
    postTelemetry({
      metric: 'signin',
      resource: window.location.href,
    });

    // Handle redirect after successful login
    const interruptedPath = localStorage.getItem('interruptedPath');

    nextTick(() => {
      if (interruptedPath) {
        router.push(interruptedPath);
        localStorage.removeItem('interruptedPath');
      } else {
        router.push({ name: 'Home' });
      }
    });
  }

  const logoutFan = (redirectToRoute?: keyof RouteNamedMap) => {
    trackFanLogout(fanStore?.fanId);
    cookies.remove('f_uauth', { path: '/' });
    cookies.remove('f_subscription_id', { path: '/' });
    authToken.value = undefined;
    subscriptionId.value = undefined;
    resetLoginFan();
    resetLoginMagicLink();
    fanStore.clear();
    if (redirectToRoute) router.push({ name: redirectToRoute });
  };

  /** Emails a link to `/signup?token=…`. New fans verify; existing fans get a login link. */
  const sendSignUp = async (email: string) => {
    await executeSendSignUp(async (signal) => {
      let captcha: string;
      try {
        captcha = await reCaptcha.execute('signup');
      } catch (error) {
        console.error(error);
        return { success: false as const, message: t('errors.captchaFailed') };
      }
      const friendId = localStorage.getItem('friendId') || undefined;
      const consent = document.createElement('div');
      consent.innerHTML = t('dynamic.termsSignup', { artistName: artistStore.name });
      const result = await signupStart(
        {
          artistId: artistStore.id,
          email,
          captcha,
          consentEmail: true,
          confirmEmail: true,
          returnUrl: `${artistStore.returnUrl}/signup`,
          url: window.location.href,
          evidence: consent.textContent ?? '',
          ...(friendId && { friendId }),
        },
        signal,
      );
      // The raw rejection includes the captcha score and user agent, so keep it off the page.
      return !result.success &&
        /failed captcha|NO_CAPTCHA|NO_TOKEN_PROPERTIES/i.test(result.message)
        ? { success: false as const, message: t('errors.captchaFailed') }
        : result;
    });
  };

  /** Exchanges the emailed signup token for a logged-in session, once fan2.1 has created the fan. */
  const signUp = async (friendId?: string) => {
    await executeSignUp(async (signal) => {
      const confirm = await signupConfirm(
        { friendId, artistId: artistStore.id },
        tokenInQuery.value,
        signal,
      );
      if (!confirm.success) return confirm;
      const fetchFan = () => getFan({ artistId: artistStore.id }, confirm.data.token, signal);
      let fan = await fetchFan();
      for (let i = 0; i < 10 && !fan.success && fan.message.includes('fan is pending'); i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        fan = await fetchFan();
      }
      return fan;
    });
  };

  const sendChangeEmail = async (email: string) => {
    await executeSendChangeEmail((signal) =>
      sendChangeEmailApi(
        { email, returnUrl: `${artistStore.returnUrl}/change-email`, artistId: artistStore.id },
        authToken.value,
        signal,
      ),
    );
  };

  const loginChangeEmail = async (token: string, email: string) => {
    await executeLoginChangeEmail((signal) => changeEmail({ email }, token, signal));
  };

  const sendForgotPassword = async (email: string) => {
    await executeSendForgotPassword((signal) =>
      sendForgotPasswordApi(
        { email, returnUrl: `${artistStore.returnUrl}/reset-password`, artistId: artistStore.id },
        tokenInQuery.value,
        signal,
      ),
    );
  };

  const loginChangePassword = async (password: string) => {
    await executeLoginChangePassword((signal) =>
      changePassword({ password }, tokenInQuery.value, signal),
    );
  };

  const sendMagicLink = async (email: string) => {
    await executeSendMagicLink((signal) =>
      sendMagicLinkApi(
        { email, returnUrl: `${artistStore.returnUrl}/login`, artistId: artistStore.id },
        tokenInQuery.value,
        signal,
      ),
    );
  };

  return {
    guestEmail,
    authToken,
    subscriptionId,
    isAuthenticated,
    isMember,
    tokenInQuery,
    friendIdInQuery,
    initializeAuthState,
    setAuthToken,
    setSubscriptionId,

    loginFanData,
    loginFanError,
    isLoginFanFetching,
    loginFan,
    logoutFan,

    sendMagicLinkData,
    sendMagicLinkError,
    isSendMagicLinkFetching,
    sendMagicLink,
    loginMagicLinkData,
    loginMagicLinkError,
    isLoginMagicLinkFetching,
    loginMagicLink,

    sendForgotPasswordData,
    sendForgotPasswordError,
    isSendForgotPasswordFetching,
    sendForgotPassword,
    loginChangePasswordData,
    loginChangePasswordError,
    isLoginChangePasswordFetching,
    loginChangePassword,

    sendChangeEmailData,
    sendChangeEmailError,
    isSendChangeEmailFetching,
    sendChangeEmail,
    loginChangeEmailData,
    loginChangeEmailError,
    isLoginChangeEmailFetching,
    loginChangeEmail,

    sendSignUpData,
    sendSignUpError,
    isSendSignUpFetching,
    sendSignUp,
    preloadCaptcha: reCaptcha.preload,
    signUpData,
    signUpError,
    isSignUpFetching,
    signUp,
  };
});
