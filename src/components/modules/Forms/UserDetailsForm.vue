<template>
  <div>
    <form
      class="form-wrapper"
      name="user-details-form"
      data-form-type="user-details"
      @submit.prevent="onSubmit"
    >
      <InputWrapped
        v-if="collectFields.firstName"
        :placeholder="t('input.label.firstName')"
        :label="t('input.label.firstName')"
        name="firstName"
        type="text"
        v-model="firstName"
        v-bind="firstNameAttrs"
        :error="errors.firstName"
        :variant="variant"
        :disabled="isSubmitting || isLoading"
        autocomplete="given-name"
        :is-loading="isSubmitting"
        :submit-successful="isSubmitting === false && !error"
        @submit="onSubmit"
      />
      <InputWrapped
        v-if="collectFields.lastName"
        :placeholder="t('input.label.lastName')"
        :label="t('input.label.lastName')"
        name="lastName"
        type="text"
        v-model="lastName"
        v-bind="lastNameAttrs"
        :error="errors.lastName"
        :variant="variant"
        :disabled="isSubmitting || isLoading"
        autocomplete="family-name"
      />
      <InputWrapped
        v-if="collectFields.username"
        :placeholder="t('input.label.username')"
        :label="t('input.label.username')"
        name="username"
        type="text"
        v-model="username"
        v-bind="usernameAttrs"
        :error="errors.username"
        :variant="variant"
        :disabled="isSubmitting || isLoading"
        autocomplete="username"
      />
      <InputWrapped
        v-if="collectFields.email"
        :placeholder="t('input.label.email')"
        :label="t('input.label.email')"
        name="email"
        type="email"
        v-model="email"
        v-bind="emailAttrs"
        :error="errors.email"
        :disabled="isSubmitting || isLoading"
        :variant="variant"
        autocomplete="username"
        :readonly="emailDisabled"
      />
      <InputLocation
        v-if="collectFields.location"
        :placeholder="t('input.placeholder.location')"
        name="location"
        :label="t('input.label.location')"
        v-model="location"
        :variant="variant || 'default'"
        v-bind="locationAttrs"
        :errorInput="errors.location"
        :disabled="isSubmitting || isLoading"
      />
      <PhoneNumberWrapped
        v-if="collectFields.phoneNumber"
        :placeholder="t('input.label.phoneNumber')"
        :label="t('input.label.phoneNumber')"
        name="phoneNumber"
        v-model="phoneNumber"
        v-bind="phoneNumberAttrs"
        :error="errors.phoneNumber"
        :disabled="isSubmitting || isLoading"
      />
      <DatePickerWrapped
        v-if="collectFields.birthDate"
        :placeholder="t('input.placeholder.birthDate')"
        :label="t('input.label.birthDate')"
        name="birthDate"
        v-model="birthDate"
        :variant="variant"
        v-bind="birthDateAttrs"
        :error="errors.birthDate"
        :disabled="isSubmitting || isLoading"
        :minYearsAgo="minAge"
      />
      <div
        v-if="collectFields.consentEmail || collectFields.consentMessaging"
        class="grid gap-y-2 pb-2"
      >
        <CheckboxWrapped
          v-if="collectFields.consentEmail"
          :model-value="consentEmail || false"
          @update:model-value="consentEmail = $event"
          :label="consentEmailLabel"
          name="consentEmail"
          :variant="variant"
          v-bind="consentEmailAttrs"
          :error="errors.consentEmail"
          :disabled="isSubmitting || isLoading"
        />
        <CheckboxWrapped
          v-if="collectFields.consentMessaging"
          :model-value="consentMessaging || false"
          @update:model-value="consentMessaging = $event"
          :label="consentMessagingLabel"
          :variant="variant"
          name="consentMessaging"
          v-bind="consentMessagingAttrs"
          :error="errors.consentMessaging"
          :disabled="isSubmitting || isLoading"
        />
      </div>
      <Button
        class="mx-auto w-max px-12"
        type="submit"
        :variant="buttonVariant"
        :disabled="isSubmitting || isLoading || !hasChanges"
        :loading="isSubmitting"
      >
        <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin stroke-white" />
        {{ submitButtonText || (isSubmitting ? t('common.submitting') : t('common.submit')) }}
      </Button>
      <InfoBar
        v-if="error"
        variant="destructive"
        :title="t('common.error')"
        :message="error"
        @close="emit('clearError')"
      />
      <InfoBar
        v-if="success"
        variant="success"
        :title="t('common.success')"
        :message="success"
        @close="emit('clearSuccess')"
      />
    </form>
    <slot name="form-footer" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useTranslation } from '@/locales/i18n';
import { useArtistStore } from '@stores/artist.store';
import { useAccountStore } from '@/stores/account.store';
import { storeToRefs } from 'pinia';
import {
  DefaultFormFanData,
  type CollectFields,
  type RequiredFields,
  type FormDataFan,
  type FanUpdateData,
  FanAddress,
  FanLocation,
} from '@/api/fan.api';
import type { ButtonVariants } from '@ui/button';
import type { InputVariants } from '@ui/input';
import { parseISO, isBefore, isEqual, startOfDay, endOfDay, subYears } from 'date-fns';

import { Loader2 } from 'lucide-vue-next';
import Button from '@ui/button/Button.vue';
import InfoBar from '@generics/InfoBar.vue';
import InputWrapped from '@modules/Inputs/InputWrapped/InputWrapped.vue';
import CheckboxWrapped from '@modules/Inputs/CheckboxWrapped/CheckboxWrapped.vue';
import DatePickerWrapped from '@modules/Inputs/DatePickerWrapped/DatePickerWrapped.vue';
import InputLocation from '@modules/Inputs/InputLocation/InputLocation.vue';
import PhoneNumberWrapped from '@modules/Inputs/PhoneNumberWrapped/PhoneNumberWrapped.vue';

const { t } = useTranslation();

const props = withDefaults(
  defineProps<{
    formName?: string;
    initialValues?: Partial<FormDataFan> | null;
    disabled?: boolean;
    emailDisabled?: boolean;
    collectFields?: CollectFields;
    requiredFields?: RequiredFields;
    submitButtonText?: string;
    error?: string | null;
    success?: string;
    isSubmitting?: boolean;
    isLoading?: boolean;
    buttonVariant?: ButtonVariants['variant'];
    variant?: InputVariants['variant'];
  }>(),
  {
    formName: 'userDetailsForm',
    initialValues: () => DefaultFormFanData,
    collectFields: () => ({}),
    requiredFields: () => ({}),
    submitButtonText: '',
    error: null,
    success: '',
  },
);
const emit = defineEmits<{
  (e: 'submit', payload: FanUpdateData): void;
  (e: 'change'): void;
  (e: 'clearError'): void;
  (e: 'clearSuccess'): void;
}>();

const artistStore = useArtistStore();
const accountStore = useAccountStore();
const { isAuthenticated } = storeToRefs(accountStore);
const { name: artistName, minAge } = storeToRefs(artistStore);

const consentEmailLabel = computed(() => t('dynamic.termsEmail', { artistName: artistName.value }));
const consentMessagingLabel = computed(() =>
  t('dynamic.termsPhone', { artistName: artistName.value }),
);

const createValidationSchema = () => {
  const schema: {
    avatarUrl: z.ZodString | z.ZodOptional<z.ZodString>;
    birthDate: z.ZodString | z.ZodOptional<z.ZodString>;
    consentEmail: z.ZodBoolean | z.ZodLiteral<true>;
    consentMessaging: z.ZodBoolean | z.ZodLiteral<true>;
    email: z.ZodEmail | z.ZodOptional<z.ZodEmail>;
    firstName: z.ZodString | z.ZodOptional<z.ZodString>;
    lastName: z.ZodString | z.ZodOptional<z.ZodString>;
    username: z.ZodString | z.ZodOptional<z.ZodString>;
    location: typeof FanLocation | z.ZodOptional<typeof FanLocation>;
    phoneNumber: z.ZodString | z.ZodOptional<z.ZodString>;
    shirtSize: z.ZodString | z.ZodOptional<z.ZodString>;
    state: z.ZodString | z.ZodOptional<z.ZodString>;
    deliveryAddress: z.ZodString | z.ZodOptional<z.ZodString>;
    deliveryAddressStructured: typeof FanAddress | z.ZodOptional<typeof FanAddress>;
  } = {
    avatarUrl: z.string().optional(),
    birthDate: z.string().optional(),
    consentEmail: z.boolean(),
    consentMessaging: z.boolean(),
    email: z.email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    location: FanLocation.optional(),
    phoneNumber: z.string().optional(),
    shirtSize: z.string().optional(),
    state: z.string().optional(),
    deliveryAddress: z.string().optional(),
    deliveryAddressStructured: FanAddress.optional(),
  };

  if (props.requiredFields.firstName) {
    schema.firstName = z.string().min(1, t('errors.required'));
  }
  if (props.requiredFields.lastName) {
    schema.lastName = z.string().min(1, t('errors.required'));
  }
  if (props.requiredFields.username) {
    schema.username = z.string().min(1, t('errors.required'));
  }
  if (props.requiredFields.email) {
    schema.email = z.email({
      error: (iss) => (!iss.input ? t('errors.required') : t('errors.invalidEmail')),
    });
  }
  if (props.requiredFields.phoneNumber) {
    schema.phoneNumber = z
      .string()
      .min(1, t('errors.required'))
      .regex(/^\+[1-9]\d{1,14}$/, t('errors.invalidPhoneNumber'));
  }
  if (props.requiredFields.location) {
    schema.location = FanLocation;
  }
  if (props.requiredFields.birthDate) {
    schema.birthDate = z
      .string()
      .min(1, t('errors.required'))
      .refine(
        (value) => {
          if (!value) return true;
          const selectedDate = startOfDay(parseISO(value));
          const maxDate = endOfDay(subYears(new Date(), minAge.value));
          return isBefore(selectedDate, maxDate) || isEqual(selectedDate, maxDate);
        },
        t('dynamic.minAgeNotMet', { minAge: minAge.value }),
      );
  }
  if (props.requiredFields.consentEmail) {
    schema.consentEmail = z.literal(true, t('errors.required'));
  }
  if (props.requiredFields.consentMessaging) {
    schema.consentMessaging = z.literal(true, t('errors.required'));
  }

  return z.object(schema);
};

const schema = computed(() => toTypedSchema(createValidationSchema()));

const { errors, handleSubmit, controlledValues, defineField, values, setValues } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: { ...DefaultFormFanData, ...props.initialValues },
});

const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [username, usernameAttrs] = defineField('username');
const [email, emailAttrs] = defineField('email');
const [phoneNumber, phoneNumberAttrs] = defineField('phoneNumber');
const [location, locationAttrs] = defineField('location');
const [birthDate, birthDateAttrs] = defineField('birthDate');
const [consentEmail, consentEmailAttrs] = defineField('consentEmail');
const [consentMessaging, consentMessagingAttrs] = defineField('consentMessaging');

function isLocationEqual(a?: FanLocation, b?: FanLocation): boolean {
  if (a === b) return true;
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.countryCode === b.countryCode &&
    a.city === b.city
  );
}

const hasChanges = computed(() => {
  const initial = { ...DefaultFormFanData, ...props.initialValues };
  const current = controlledValues.value;

  return (Object.keys(current) as (keyof FanUpdateData)[]).some((key) => {
    const initialValue = initial[key as keyof typeof initial];
    const currentValue = current[key as keyof typeof current];
    if (key === 'location') {
      if (!props.collectFields.location || !isAuthenticated.value) return false;
      return !isLocationEqual(initialValue as FanLocation, currentValue as FanLocation);
    }
    return currentValue !== initialValue;
  });
});

const onSubmit = handleSubmit(() => {
  const initial = { ...DefaultFormFanData, ...props.initialValues };
  const current = controlledValues.value;
  const payload: { [key: string]: unknown } = {};

  (Object.keys(current) as (keyof FanUpdateData)[]).forEach((key) => {
    const initialValue = initial[key as keyof typeof initial];
    const currentValue = current[key as keyof typeof current];

    if (key === 'location' && (!props.collectFields.location || !isAuthenticated.value)) {
      return;
    }

    const isChanged =
      key === 'location'
        ? !isLocationEqual(initialValue as FanLocation, currentValue as FanLocation)
        : currentValue !== initialValue;

    if (isChanged) {
      if (typeof initialValue === 'string' && currentValue === '') {
        payload[key] = null;
      } else {
        payload[key] = currentValue;
      }
    }
  });

  if (!Object.keys(payload).length) return;

  emit('submit', payload as FanUpdateData);
});

watch(
  () => props.initialValues,
  (newValue) => {
    if (newValue) setValues(newValue);
  },
);

watch(values, () => emit('change'), { deep: true });
</script>
