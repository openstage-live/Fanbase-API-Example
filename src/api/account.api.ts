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

type SignUpPayload = {
  artistId: string;
  password?: string;
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

type SendSignUpPayload = {
  artistId: string;
  email: string;
  returnUrl: string;
};

export type SignUpResponse = z.infer<typeof SignUpResponse>;
export type EmailResponse = z.infer<typeof EmailResponse>;
export type ChangeDetailsResponse = z.infer<typeof ChangeDetailsResponse>;

// Response schemas
const SignUpResponse = z.object({
  auth: z.string(),
  consentEmail: z.boolean(),
  consentMessaging: z.boolean(),
  consentSms: z.boolean(),
  createdAt: z.iso.datetime().optional(),
  email: z.string(),
  id: z.string(),
  location: z.object({}).optional(),
  role: z.string(),
  subscribed: z.boolean(),
  subscribedAt: z.iso.datetime().optional(),
  token: z.string(),
  updatedAt: z.iso.datetime(),
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

export async function signUp(params: SignUpPayload, token: string, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/signup`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    SignUpResponse,
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

export async function sendSignUp(payload: SendSignUpPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/email/signup`,
      data: payload,
    },
    EmailResponse,
    { signal },
  );
}
