import { z } from 'zod';
import { ApiOk, apiService } from '@/api/api.service';

// ==================== Types ==================== //
export type FanTransactionsResponse = z.infer<typeof FanTransactionsResponse>;
export type FanAttributesResponse = z.infer<typeof FanAttributesResponse>;
export type FanFriendLinkResponse = z.infer<typeof FanFriendLinkResponse>;
export type FanSubscribeResponse = z.infer<typeof FanSubscribeResponse>;
export type FanFriendsResponse = z.infer<typeof FanFriendsResponse>;
export type FanLikesResponse = z.infer<typeof FanLikesResponse>;
export type FanCommentsResponse = z.infer<typeof FanCommentsResponse>;
export type Fan = z.infer<typeof Fan>;
export type FanAddress = z.infer<typeof FanAddress>;
export type FanLocation = z.infer<typeof FanLocation>;

export interface FormDataFan {
  avatarUrl?: string;
  birthDate?: string;
  consentEmail: boolean;
  consentSms: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  retypePassword?: string;
  location?: FanLocation;
  phoneNumber?: string;
  shirtSize?: string;
  state?: string;
  deliveryAddress?: string;
  deliveryAddressStructured?: FanAddress;
}

export const DefaultFormFanData: FormDataFan = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  location: undefined,
  birthDate: '',
  consentEmail: false,
  consentSms: false,
  password: '',
  retypePassword: '',
  avatarUrl: undefined,
};

type Nullable<T> = {
  [K in keyof T]?: T[K] | null;
};

export type FanUpdateData = Nullable<FormDataFan>;

export type FanAttributeData = {
  key: string;
  value: string;
};

export type FanFriendLinkData = {
  url: string;
};

export interface CollectFields {
  firstName?: boolean;
  lastName?: boolean;
  username?: boolean;
  email?: boolean;
  location?: boolean;
  phoneNumber?: boolean;
  birthDate?: boolean;
  password?: boolean;
  consentEmail?: boolean;
  consentNotifications?: boolean;
  consentSms?: boolean;
}

export interface RequiredFields {
  firstName?: boolean;
  lastName?: boolean;
  username?: boolean;
  email?: boolean;
  location?: boolean;
  phoneNumber?: boolean;
  birthDate?: boolean;
  password?: boolean;
  consentEmail?: boolean;
  consentSms?: boolean;
}

interface FanBasePayload {
  artistId: string;
}
interface FanUpdatePayload extends FanBasePayload, FanUpdateData {}
interface FanAttributePayload extends FanBasePayload, FanAttributeData {}
interface FanFriendLinkPayload extends FanBasePayload, FanFriendLinkData {}
interface FanSubscribePayload {
  tierId: string;
}

// ==================== Schemas ==================== //
export const FanAddress = z.object({
  house: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postcode: z.string().optional(),
  shirtSize: z.string().optional(),
  version: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
  stateCode: z.string().optional(),
  postalCode: z.string().optional(),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  formattedAddress: z.string().optional(),
  source: z.enum(['radar', 'google', 'manual']).optional(),
  verified: z.boolean().optional(),
});

export const FanLocation = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  countryCode: z.string().optional(),
  addressLabel: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  county: z.string().optional(),
  country: z.string().optional(),
});

export const Fan = z.object({
  auth: z.string(),
  avatarUrl: z.string().optional(),
  birthDate: z.string().optional(),
  city: z.string().optional(),
  consentEmail: z.boolean(),
  consentMessaging: z.boolean(),
  consentNotifications: z.boolean().optional(),
  consentSms: z.boolean(),
  countryCallingCode: z.string().optional(),
  countryCode: z.string().optional(),
  createdAt: z.iso.datetime(),
  dateOfBirth: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryAddressStructured: FanAddress.optional(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  fullName: z.string().optional(),
  id: z.string(),
  lastName: z.string().optional(),
  latitude: z.number().optional(),
  locale: z.string().optional(),
  location: FanLocation.optional(),
  longitude: z.number().optional(),
  nationalPhoneNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.string(),
  shirtSize: z.string().optional(),
  socialHandleFacebook: z.string().optional(),
  socialHandleInstagram: z.string().optional(),
  socialHandleTiktok: z.string().optional(),
  socialHandleTwitter: z.string().optional(),
  socialHandleYoutube: z.string().optional(),
  state: z.string().optional(),
  subscribed: z.boolean(),
  subscribedAt: z.iso.datetime().optional(),
  subscriptionCancelledAt: z.iso.datetime().optional(),
  subscriptionId: z.string().optional(),
  timeZone: z.string().optional(),
  token: z.string(),
  updatedAt: z.iso.datetime(),
  username: z.string().optional(),
});

const FanAttributesResponse = z.record(z.string(), z.unknown());

const FanSubscribeResponse = z.union([
  z.object({
    clientSecret: z.string(),
  }),
  ApiOk,
]);

const FanTransactionsResponse = z.array(
  z.object({
    type: z.string(),
    source: z.string().optional(),
    description: z.string().optional(),
    value: z.number().optional(),
    volume: z.number().optional(),
    transactionDate: z.string(),
  }),
);

const FanFriendsResponse = z.array(
  z.object({
    createdAt: z.string(),
    id: z.string(),
    name: z.string(),
  }),
);

const FanLikesResponse = z.array(
  z.object({
    createdAt: z.iso.datetime(),
    postId: z.string(),
    resource: z.string().optional(),
    commentId: z.string().optional(),
  }),
);

const FanFriendLinkResponse = z.object({
  link: z.string(),
});

const FanCommentsResponse = z.array(
  z.object({
    comment: z.string(),
    commentId: z.string(),
    createdAt: z.iso.datetime(),
    postId: z.string(),
    resource: z.string().optional(),
    replyToId: z.string().optional(),
  }),
);

// ==================== API Functions ==================== //
export async function getFan(params: FanBasePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/fan`,
      params,
    },
    Fan,
    { signal, requiresAuth: true },
  );
}

export async function patchFan(params: FanUpdatePayload, token?: string, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'PATCH',
      url: `${apiService.openstageApiFan}/fan`,
      data: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    Fan,
    { signal, requiresAuth: !token },
  );
}

export async function subscribeFan(params: FanSubscribePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/subscribe`,
      data: params,
    },
    FanSubscribeResponse,
    { signal, requiresAuth: true },
  );
}

export async function unsubscribeFan(params: FanBasePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'DELETE',
      url: `${apiService.openstageApiFan}/fan/subscribe`,
      params,
    },
    ApiOk,
    { signal, requiresAuth: true },
  );
}

export async function addFanAttribute(params: FanAttributePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/attribute`,
      data: params,
    },
    ApiOk,
    { signal, requiresAuth: true },
  );
}

export async function getFanAttributes(signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/fan/attribute`,
    },
    FanAttributesResponse,
    { signal, requiresAuth: true },
  );
}

export async function getFanTransactions(params: FanBasePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/fan/transaction`,
      params,
    },
    FanTransactionsResponse,
    { signal, requiresAuth: true },
  );
}

export async function createFriendLink(params: FanFriendLinkPayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'POST',
      url: `${apiService.openstageApiFan}/fan/friend`,
      data: params,
    },
    FanFriendLinkResponse,
    { signal, requiresAuth: true },
  );
}

export async function getFanFriends(params: FanBasePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/fan/friend`,
      params,
    },
    FanFriendsResponse,
    { signal, requiresAuth: true },
  );
}

export async function getFanLikes(params: FanBasePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/fan/like`,
      params,
    },
    FanLikesResponse,
    { signal, requiresAuth: true },
  );
}

export async function getFanComments(params: FanBasePayload, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${apiService.openstageApiFan}/fan/comment`,
      params,
    },
    FanCommentsResponse,
    { signal, requiresAuth: true },
  );
}
