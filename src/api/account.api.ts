import { apiService } from '@/api/api.service';
import { z } from 'zod';
import { Fan } from '@/api/fan.api';

// Fetcher-specific types
type LoginPayload = {
  artistId: string;
  email: string;
  password: string;
  friendId?: string;
};

type MagicLinkPayload = {
  artistId: string;
  token: string;
  friendId?: string;
};

type ChangePasswordPayload = {
  password: string;
};

type ChangeEmailPayload = {
  email: string;
};

type SignupStartPayload = {
  artistId: string;
  email: string;
  captcha: string;
  consentEmail: true;
  confirmEmail: true;
  /** The API appends `?token=…` itself. */
  returnUrl: string;
  friendId?: string;
  /** GDPR consent evidence: the page the fan consented on. */
  url: string;
  /** GDPR consent evidence: the legal copy shown when the fan consented. */
  evidence: string;
};

type SignupConfirmPayload = {
  artistId: string;
  friendId?: string;
};

type SendChangeEmailPayload = {
  artistId: string;
  email: string;
  returnUrl: string;
};

type SendForgotPasswordPayload = {
  artistId: string;
  email: string;
  returnUrl: string;
};

type SendMagicLinkPayload = {
  artistId: string;
  email: string;
  returnUrl: string;
};

export type SignupStartResponse = z.infer<typeof SignupStartResponse>;
export type EmailResponse = z.infer<typeof EmailResponse>;
export type ChangeDetailsResponse = z.infer<typeof ChangeDetailsResponse>;

// Response schemas
/** Guest (`nonAuthoritative`) session for the captured email. Not a fan record. */
const SignupStartResponse = z.object({
  role: z.literal('nonAuthoritative'),
  token: z.string(),
  consentEmail: z.boolean(),
  consentMessaging: z.boolean(),
});

/** New fans get only a token; fan2.1 creates the fan row asynchronously. */
const SignupConfirmResponse = z.object({
  token: z.string(),
});

const ChangeDetailsResponse = z.object({
  status: z.string(),
});

const EmailResponse = z.object({
  message: z.string(),
});

// API functions
export async function login(params: LoginPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/login`,
      data: params,
    },
    Fan,
    { signal },
  );
}

export async function magicLink(params: MagicLinkPayload, token: string, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/login/magic-link`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    Fan,
    { signal },
  );
}

export async function changePassword(
  params: ChangePasswordPayload,
  token: string,
  signal?: AbortSignal,
) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/login/change-password`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    ChangeDetailsResponse,
    { signal },
  );
}

export async function changeEmail(params: ChangeEmailPayload, token: string, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/login/change-email`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    ChangeDetailsResponse,
    { signal },
  );
}

export async function signupConfirm(
  params: SignupConfirmPayload,
  token: string,
  signal?: AbortSignal,
) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/signup-confirm`,
      data: params,
      headers: { Authorization: `Bearer ${token}` },
    },
    SignupConfirmResponse,
    { signal },
  );
}

export async function sendChangeEmail(
  params: SendChangeEmailPayload,
  token?: string,
  signal?: AbortSignal,
) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/email/change-email`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    EmailResponse,
    { signal },
  );
}

export async function sendForgotPassword(
  params: SendForgotPasswordPayload,
  token?: string,
  signal?: AbortSignal,
) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/email/forgot-password`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    EmailResponse,
    { signal },
  );
}

export async function sendMagicLink(
  params: SendMagicLinkPayload,
  token?: string,
  signal?: AbortSignal,
) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/email/magic-link`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    EmailResponse,
    { signal },
  );
}

export async function signupStart(payload: SignupStartPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/signup-start`,
      data: payload,
    },
    SignupStartResponse,
    { signal },
  );
}
