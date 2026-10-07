<template>
  <div>
    <form
      class="form-wrapper"
      name="user-details-form"
      data-form-type="user-details"
      @submit.prevent="onFormSubmit"
    >
      <div class="flex flex-col">
        <AvatarUpload :is-submitting="isSubmitting" :is-loading="isFanFetching" />
        <span class="my-4 flex justify-center text-center font-Matter-Bold text-2xl">{{
          username || fullName
        }}</span>
        <div v-if="fanSubscriptionId" class="mt-1 flex items-center justify-center gap-x-1">
          <div class="font-Matter-Medium text-base uppercase">
            {{ t('profile.memberSince') }}
            <span class="font-Matter-Medium text-base">
              {{ formattedSubscriptionDate }}
            </span>
          </div>
        </div>
      </div>
      <h3 class="title-md dark:text-white">
        {{ t('profile.aboutYa') }}
      </h3>
      <div class="my-1 flex gap-x-3">
        <div class="flex flex-grow flex-col gap-y-3">
          <InputWrapped
            v-if="collectFields.firstName"
            :placeholder="t('input.label.firstName')"
            :label="t('input.label.firstName')"
            name="firstName"
            type="text"
            v-model="firstName"
            v-bind="firstNameAttrs"
            :error="errors.firstName"
            :disabled="isSubmitting || isFanFetching"
            autocomplete="given-name"
            :is-loading="isSubmitting"
            :submit-successful="isSubmitting === false && !fanPatchError"
            @submit="onFormSubmit"
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
            :disabled="isSubmitting || isFanFetching"
            autocomplete="family-name"
          />
        </div>
      </div>
      <div v-if="collectFields.email" class="-mt-1">
        <div ref="emailInputWrapper" class="input-wrapper">
          <div class="relative" :class="'mt-4'">
            <Label
              for="email"
              variant="default"
              :class="[
                'pointer-events-none px-2 text-sm',
                'bg-transparent',
                errors.email && '!text-destructive',
                `absolute start-1 top-2 z-10 origin-[0] -translate-y-7 scale-75 transform rounded-tl-lg rounded-tr-lg duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:bg-background/100 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4`,
              ]"
              >{{ t('input.label.email') }}</Label
            >
            <div class="w-full">
              <div class="relative">
                <Button
                  type="button"
                  variant="input"
                  :class="[errors.email && 'border-destructive', !email && `text-muted-foreground`]"
                  :disabled="isSubmitting || isFanFetching"
                  @click="openEmailDialog"
                >
                  <span class="dark:text-white">
                    {{ email || t('input.label.email') }}
                  </span>
                  <ChangeEmailDialog
                    v-model="isEmailPopoverOpen"
                    :disabled="isSubmitting || isFanFetching"
                    class="absolute right-0 min-h-6 min-w-6"
                  />
                </Button>
              </div>
            </div>
            <span v-if="errors.email" class="input-error">{{ errors.email }}</span>
          </div>
        </div>
      </div>
      <div>
        <InputWrapped
          v-if="collectFields.username"
          :placeholder="t('input.label.username')"
          :label="t('input.label.username')"
          name="username"
          type="text"
          v-model="username"
          v-bind="usernameAttrs"
          :error="errors.username"
          :disabled="isSubmitting || isFanFetching"
          autocomplete="username"
        />
        <p class="mt-2 px-4 text-[11px] leading-tight">
          {{ t('profile.usernameDescription') }}
        </p>
      </div>
      <InputLocation
        class="-mt-1"
        v-if="collectFields.location && isAuthenticated"
        :placeholder="t('input.placeholder.location')"
        name="location"
        :label="t('input.label.location')"
        v-model="location"
        variant="default"
        v-bind="locationAttrs"
        :errorInput="errors.location"
        :disabled="isSubmitting || isFanFetching"
      />
      <PhoneNumberWrapped
        v-if="collectFields.phoneNumber"
        :placeholder="t('input.label.phoneNumber')"
        :label="t('input.label.phoneNumber')"
        name="phoneNumber"
        v-model="phoneNumber"
        v-bind="phoneNumberAttrs"
        :error="errors.phoneNumber"
        :disabled="isSubmitting || isFanFetching"
      />
      <DatePickerWrapped
        v-if="collectFields.birthDate"
        :placeholder="t('input.placeholder.birthDate')"
        :label="t('input.label.birthDate')"
        name="birthDate"
        v-model="birthDate"
        v-bind="birthDateAttrs"
        :error="errors.birthDate"
        :disabled="isSubmitting || isFanFetching"
        :minYearsAgo="minAge"
      />
      <template v-if="fanData">
        <!-- Address Form Button -->
        <div class="address-form-section space-y-4">
          <div ref="addressInputWrapper" class="input-wrapper">
            <div class="relative" :class="'mt-4'">
              <Label
                for="shippingAddress"
                variant="default"
                :class="[
                  'pointer-events-none px-2 text-sm',
                  'bg-transparent',
                  `absolute start-1 top-2 z-10 origin-[0] -translate-y-7 scale-75 transform rounded-tl-lg rounded-tr-lg bg-white duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:bg-background/100 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4`,
                ]"
                >{{ t('addressForm.shippingAddress') }}</Label
              >
              <div class="w-full">
                <div class="relative">
                  <Button
                    type="button"
                    variant="input"
                    :class="[!hasDeliveryAddress && 'text-muted-foreground']"
                    :disabled="isSubmitting || isFanFetching"
                    @click="openAddressDialog"
                  >
                    <p class="max-w-[80vw] overflow-hidden text-ellipsis pr-4 dark:text-white">
                      {{
                        hasDeliveryAddress
                          ? formattedDeliveryAddress
                          : t('addressForm.noAddressSet')
                      }}
                    </p>
                    <div class="absolute right-3 z-10 transition hover:scale-110">
                      <SquarePen
                        class="min-h-5 min-w-5"
                        :disabled="isSubmitting || isFanFetching"
                        @click="openAddressDialog"
                      />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Shirt Size (if required) -->
          <div class="shirt-size-section">
            <Label class="mb-3 block pl-2 font-Matter-Medium text-sm">
              {{ t('input.label.shirtSize') }}
            </Label>
            <RadioGroup
              v-model="addressShirtSize"
              class="flex flex-wrap justify-start gap-3"
              :disabled="isSubmitting || isFanFetching"
            >
              <div
                v-for="size in shirtSizeOptions"
                :key="`accountAddressForm-size-${size}`"
                class="flex items-center space-x-0"
              >
                <RadioGroupItem
                  :id="`accountAddressForm-size-${size}`"
                  :value="size"
                  class="peer sr-only"
                />
                <Label
                  :for="`accountAddressForm-size-${size}`"
                  class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 text-sm font-medium transition-all peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                  :class="{
                    'border-destructive': errors.shirtSize,
                    'border-black bg-black text-white': addressShirtSize === size,
                    'border-black hover:bg-black/10': addressShirtSize !== size,
                  }"
                >
                  {{ size }}
                </Label>
              </div>
            </RadioGroup>
            <p v-if="errors.shirtSize" class="mt-1 text-sm text-destructive">
              {{ errors.shirtSize }}
            </p>
          </div>
        </div>
      </template>
      <div
        v-if="collectFields.consentEmail || collectFields.consentMessaging"
        class="mt-3 grid gap-y-2 pb-2"
      >
        <CheckboxWrapped
          v-if="collectFields.consentEmail"
          :model-value="consentEmail || false"
          @update:model-value="consentEmail = $event"
          :label="consentEmailLabel"
          name="consentEmail"
          v-bind="consentEmailAttrs"
          :error="errors.consentEmail"
          :disabled="isSubmitting || isFanFetching"
        />
        <CheckboxWrapped
          v-if="collectFields.consentMessaging"
          :model-value="consentMessaging || false"
          @update:model-value="consentMessaging = $event"
          :label="consentMessagingLabel"
          name="consentMessaging"
          v-bind="consentMessagingAttrs"
          :error="errors.consentMessaging"
          :disabled="isSubmitting || isFanFetching"
        />
      </div>
      <div class="flex place-items-center justify-between pt-2">
        <Button
          type="submit"
          :disabled="isSubmitting || isFanFetching || !hasChanges"
          :loading="isSubmitting"
        >
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin stroke-white" />
          {{ isSubmitting ? t('common.saving') : t('common.save') }}
        </Button>
        <Button variant="link" size="sm" @click="handleSignOut">
          {{ t('common.signOut') }}
        </Button>
      </div>
      <InfoBar
        v-if="fanPatchError"
        variant="destructive"
        :title="t('common.error')"
        :message="fanPatchError"
        @close="resetErrorAndSuccess"
      />
      <InfoBar
        v-if="fanPatchData"
        variant="success"
        :title="t('common.success')"
        :message="t('profile.success')"
        @close="resetErrorAndSuccess"
      />
    </form>

    <!-- Address Dialog -->
    <Dialog :open="isAddressDialogOpen" @update:open="isAddressDialogOpen = $event">
      <DialogContent class="max-h-screen sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle class="mb-1 font-Matter-Bold text-2xl uppercase">{{
            t('addressForm.title')
          }}</DialogTitle>
          <DialogDescription class="text-balance">{{
            t('addressForm.description')
          }}</DialogDescription>
        </DialogHeader>

        <div class="form-wrapper space-y-4" name="address-form" data-form-type="address">
          <div class="enhanced-address-form">
            <div class="address-section space-y-4">
              <!-- Primary Location Input - LocationCombobox -->
              <div
                v-if="!country || showLocationCombobox"
                class="location-combobox-section border-b border-black/20 pb-5"
              >
                <LocationCombobox
                  ref="locationComboboxRef"
                  :label="t('addressForm.address')"
                  name="location"
                  :placeholder="t('addressForm.searchLocation')"
                  :empty-message="t('addressForm.noLocationsFound')"
                  :with-address="true"
                  @update:model-value="onLocationChange"
                >
                  <template #dropdownBottom>
                    <Button size="sm" @click="addAddressManually">{{
                      t('addressForm.addManually')
                    }}</Button>
                  </template>
                </LocationCombobox>
              </div>

              <Button
                v-if="country && !showLocationCombobox"
                size="sm"
                variant="secondary"
                class="mx-auto flex"
                @click="showLocationCombobox = true"
              >
                <MapPin class="h-4 w-4 stroke-white" />
                {{ t('addressForm.showLocationSearch') }}
              </Button>

              <!-- Geolocation Error Message -->
              <InfoBar
                v-if="geolocationError"
                variant="destructive"
                :title="t('common.error')"
                :message="getGeolocationErrorMessage()"
                @close="clearGeolocationError"
              />

              <div v-if="country || showManualForm">
                <div class="country-selection !mt-4">
                  <Label class="flex w-fit scale-75 text-sm font-medium">
                    {{ t('addressForm.country') }}
                  </Label>
                  <Select v-model="country" @update:model-value="onCountryChange" :required="false">
                    <SelectTrigger class="w-full" :class="{ 'border-destructive': errors.country }">
                      <SelectValue :placeholder="t('addressForm.selectCountry')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="countryOption in countryOptions"
                        :key="countryOption.code"
                        :value="countryOption.name"
                      >
                        {{ countryOption.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.country" class="mt-1 text-sm text-destructive">
                    {{ errors.country }}
                  </p>
                </div>

                <!-- Dynamic Address Fields Based on Country -->
                <div class="address-fields mt-4 space-y-4">
                  <InputWrapped
                    v-model="addressLine1"
                    name="addressLine1"
                    :label="fieldLabels.addressLine1"
                    :placeholder="t('addressForm.addressLine1Placeholder')"
                    :error="errors.addressLine1"
                    :required="false"
                    autocomplete="address-line1"
                  />

                  <!-- City -->
                  <InputWrapped
                    v-model="city"
                    name="city"
                    :label="fieldLabels.city"
                    :placeholder="t('addressForm.cityPlaceholder')"
                    :error="errors.city"
                    :required="false"
                    autocomplete="address-level2"
                  />

                  <!-- State/Province/County (if supported) -->
                  <InputWrapped
                    v-if="fieldConfig.state?.isSupported"
                    v-model="state"
                    name="state"
                    :label="fieldLabels.state"
                    :placeholder="getStatePlaceholder()"
                    :error="errors.state"
                    :required="fieldConfig.state?.isRequired"
                    autocomplete="address-level1"
                  />

                  <!-- Postal Code (if supported) -->
                  <InputWrapped
                    v-if="fieldConfig.postalCode?.isSupported"
                    v-model="postalCode"
                    name="postalCode"
                    :label="fieldLabels.postalCode"
                    :placeholder="getPostalCodePlaceholder()"
                    :error="errors.postalCode"
                    :required="fieldConfig.postalCode?.isRequired"
                    autocomplete="postal-code"
                  />

                  <!-- District (if supported) -->
                  <InputWrapped
                    v-if="fieldConfig.district?.isSupported"
                    v-model="district"
                    name="district"
                    :label="fieldLabels.district"
                    :placeholder="t('addressForm.districtPlaceholder')"
                    :error="errors.district"
                    :required="fieldConfig.district?.isRequired"
                  />

                  <!-- Subdistrict (if supported) -->
                  <InputWrapped
                    v-if="fieldConfig.subdistrict?.isSupported"
                    v-model="subdistrict"
                    name="subdistrict"
                    :label="fieldLabels.subdistrict"
                    :placeholder="t('addressForm.subdistrictPlaceholder')"
                    :error="errors.subdistrict"
                    :required="fieldConfig.subdistrict?.isRequired"
                  />

                  <!-- Apartment, Suite, etc. -->
                  <InputWrapped
                    v-model="addressLine2"
                    name="addressLine2"
                    :label="fieldLabels.addressLine2"
                    :placeholder="t('addressForm.addressLine2Placeholder')"
                    autocomplete="address-line2"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="button"
            :disabled="!hasAddressChanges"
            class="mx-auto w-max"
            @click="closeAddressDialog"
          >
            {{ t('addressForm.button') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useFanStore } from '@stores/fan.store';
import { useArtistStore } from '@stores/artist.store';
import { useTranslation } from '@/locales/i18n';
import { useAccountStore } from '@stores/account.store';
import { useGeolocation } from '@/composables/useGeolocation';
import { parseISO, startOfDay, endOfDay, subYears, isBefore, isEqual, format } from 'date-fns';
import {
  getSupportedCountries,
  COUNTRIES_WITH_STATES,
  COUNTRIES_WITHOUT_POSTAL_CODES,
  COUNTRIES_WITH_DISTRICTS,
} from '@api/geo.api';
import { getAddressLabels, formatAddress } from '@/utils/addressValidation';

// -- Components -- //
import InputWrapped from '@modules/Inputs/InputWrapped/InputWrapped.vue';
import CheckboxWrapped from '@modules/Inputs/CheckboxWrapped/CheckboxWrapped.vue';
import DatePickerWrapped from '@modules/Inputs/DatePickerWrapped/DatePickerWrapped.vue';
import InputLocation from '@modules/Inputs/InputLocation/InputLocation.vue';
import PhoneNumberWrapped from '@modules/Inputs/PhoneNumberWrapped/PhoneNumberWrapped.vue';
import ChangeEmailDialog from '@modules/Dialogs/ChangeEmailDialog.vue';
import AvatarUpload from '@modules/AvatarUpload/AvatarUpload.vue';
import RadioGroup from '@ui/radio-group/RadioGroup.vue';
import RadioGroupItem from '@ui/radio-group/RadioGroupItem.vue';
import Label from '@ui/label/Label.vue';
import LocationCombobox from '@modules/Inputs/LocationCombobox/LocationCombobox.vue';
import Button from '@ui/button/Button.vue';
import InfoBar from '@generics/InfoBar.vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';

// -- Icons -- //
import { Loader2, MapPin, SquarePen } from 'lucide-vue-next';

// -- Interfaces -- //
import {
  DefaultFormFanData,
  type CollectFields,
  type FanUpdateData,
  FanLocation,
  FanAddress,
} from '@/api/fan.api';

// Internal collect fields configuration
const collectFields: CollectFields = {
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  location: true,
  phoneNumber: true,
  birthDate: true,
  consentEmail: true,
  consentMessaging: true,
  consentNotifications: true,
};

// -- Composables -- //
const { t } = useTranslation();
const fanStore = useFanStore();
const accountStore = useAccountStore();
const artistStore = useArtistStore();
const { isAuthenticated } = storeToRefs(accountStore);
const { name: artistName, minAge } = storeToRefs(artistStore);
const { fanData, fanPatchData, fanPatchError, isFanFetching, fanSubscriptionId } =
  storeToRefs(fanStore);
const { geolocationError, clearError } = useGeolocation();

// -- Refs -- //
const isSubmitting = ref(false);
const isEmailPopoverOpen = ref(false);

// Address dialog state
const isAddressDialogOpen = ref(false);

// Address form state
const selectedLocation = ref<FanLocation | undefined>(undefined);
const showManualForm = ref(false);
const showLocationCombobox = ref(false);
const locationComboboxRef = ref<InstanceType<typeof LocationCombobox> | null>(null);
const countryCode = ref('');
const shirtSizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const countryOptions = getSupportedCountries();

// -- Computed -- //
const requiredFields = computed(() => fanStore.getRequiredFields());

const fieldConfig = computed(() => {
  if (countryCode.value) {
    const config: Record<string, { isSupported: boolean; isRequired: boolean }> = {
      addressLine1: { isSupported: true, isRequired: false },
      addressLine2: { isSupported: true, isRequired: false },
      city: { isSupported: true, isRequired: false },
    };

    if (COUNTRIES_WITH_STATES.includes(countryCode.value)) {
      config.state = {
        isSupported: true,
        isRequired: ['US', 'CA', 'AU'].includes(countryCode.value),
      };
    }

    if (!COUNTRIES_WITHOUT_POSTAL_CODES.includes(countryCode.value)) {
      config.postalCode = {
        isSupported: true,
        isRequired: !['IE', 'HK', 'SG'].includes(countryCode.value),
      };
    }

    if (COUNTRIES_WITH_DISTRICTS.includes(countryCode.value)) {
      config.district = { isSupported: true, isRequired: false };
      config.subdistrict = { isSupported: true, isRequired: false };
    }

    return config;
  }
  return {};
});

const fieldLabels = computed(() => {
  if (countryCode.value) {
    return getAddressLabels(countryCode.value);
  }
  return {
    addressLine1: 'Street Address',
    addressLine2: 'Apartment, Suite, etc.',
    city: 'City',
    state: 'State/Province',
    postalCode: 'Postal Code',
    district: 'District',
    subdistrict: 'Subdistrict',
    country: 'Country',
  };
});

const fullName = computed(() => {
  const firstName = fanData.value?.firstName || '';
  const lastName = fanData.value?.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Address-related computed properties
const hasDeliveryAddress = computed(() => {
  // Check current form values first
  if (values.addressLine1 || values.city || values.country) {
    return true;
  }

  // Fall back to stored fan data
  return (
    fanData.value?.deliveryAddressStructured &&
    Object.keys(fanData.value.deliveryAddressStructured).length > 0 &&
    (fanData.value.deliveryAddressStructured.addressLine1 ||
      fanData.value.deliveryAddressStructured.city ||
      fanData.value.deliveryAddressStructured.country)
  );
});

const formattedDeliveryAddress = computed(() => {
  // Check if we have current form values
  if (values.addressLine1 || values.city || values.country) {
    // Use current form values
    const parts = [
      values.addressLine1,
      values.city,
      values.state,
      values.country,
      values.postalCode,
    ].filter(Boolean);
    return parts.join(', ');
  }

  // Fall back to stored fan data
  if (!fanData.value?.deliveryAddressStructured) {
    return '';
  }

  const addr = fanData.value.deliveryAddressStructured;
  const parts = [addr.addressLine1, addr.city, addr.state, addr.country, addr.postalCode].filter(
    Boolean,
  );

  return parts.join(', ');
});

const hasAddressChanges = computed(() => {
  if (!fanData.value?.deliveryAddressStructured) return true;

  const initial = fanData.value.deliveryAddressStructured;
  const addressChanged =
    country.value !== (initial.country || '') ||
    addressLine1.value !== (initial.addressLine1 || '') ||
    addressLine2.value !== (initial.addressLine2 || '') ||
    city.value !== (initial.city || '') ||
    state.value !== (initial.state || '') ||
    postalCode.value !== (initial.postalCode || '') ||
    district.value !== (initial.district || '') ||
    subdistrict.value !== (initial.subdistrict || '');

  // Also check if shirt size has changed
  const shirtSizeChanged = addressShirtSize.value !== (fanData.value?.shirtSize || '');

  return addressChanged || shirtSizeChanged;
});

const schema = computed(() => toTypedSchema(createValidationSchema()));

// Form-related computed properties
const consentEmailLabel = computed(() => t('dynamic.termsEmail', { artistName: artistName.value }));

const consentMessagingLabel = computed(() =>
  t('dynamic.termsPhone', { artistName: artistName.value }),
);

const formattedSubscriptionDate = computed(() => {
  const subscribedAt = fanStore.fanData?.subscribedAt;
  if (!subscribedAt) return '';

  return `${t('profile.since')} ${format(parseISO(subscribedAt), 'MMM d').toLowerCase()}`;
});

const hasChanges = computed(() => {
  const initial = { ...DefaultFormFanData, ...fanData.value };
  const current = controlledValues.value;

  return (Object.keys(current) as (keyof FanUpdateData)[]).some((key) => {
    const initialValue = initial[key as keyof typeof initial];
    const currentValue = current[key as keyof typeof current];

    if (key === 'location') {
      if (!collectFields.location || !isAuthenticated.value) return false;
      return !isLocationEqual(initialValue as FanLocation, currentValue as FanLocation);
    }
    return currentValue !== initialValue;
  });
});

// -- Methods -- //
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
    country: z.ZodString | z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodString | z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodString | z.ZodOptional<z.ZodString>;
    city: z.ZodString | z.ZodOptional<z.ZodString>;
    postalCode: z.ZodString | z.ZodOptional<z.ZodString>;
    district: z.ZodString | z.ZodOptional<z.ZodString>;
    subdistrict: z.ZodString | z.ZodOptional<z.ZodString>;
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
    country: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    district: z.string().optional(),
    subdistrict: z.string().optional(),
  };

  if (requiredFields.value.firstName) {
    schema.firstName = z.string().min(1, t('errors.required'));
  }
  if (requiredFields.value.lastName) {
    schema.lastName = z.string().min(1, t('errors.required'));
  }
  if (requiredFields.value.username) {
    schema.username = z.string().min(1, t('errors.required'));
  }
  if (requiredFields.value.email) {
    schema.email = z.email({
      error: (iss) => (!iss.input ? t('errors.required') : t('errors.invalidEmail')),
    });
  }
  if (requiredFields.value.phoneNumber) {
    schema.phoneNumber = z
      .string()
      .min(1, t('errors.required'))
      .regex(/^\+[1-9]\d{1,14}$/, t('errors.invalidPhoneNumber'));
  }
  if (requiredFields.value.location && isAuthenticated.value) {
    schema.location = FanLocation;
  }
  if (requiredFields.value.birthDate) {
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
  if (requiredFields.value.consentEmail) {
    schema.consentEmail = z.literal(true, t('errors.required'));
  }
  if (requiredFields.value.consentMessaging) {
    schema.consentMessaging = z.literal(true, t('errors.required'));
  }

  // Dynamic field validation based on fieldConfig - only for manual form
  if (showManualForm.value) {
    const config = fieldConfig.value;

    if (config.state?.isRequired) {
      schema.state = z.string().min(1, t('errors.required'));
    }

    if (config.postalCode?.isRequired) {
      schema.postalCode = z.string().min(1, t('errors.required'));
    }

    if (config.district?.isRequired) {
      schema.district = z.string().min(1, t('errors.required'));
    }

    if (config.subdistrict?.isRequired) {
      schema.subdistrict = z.string().min(1, t('errors.required'));
    }
  }

  return z.object(schema);
};

const { errors, handleSubmit, controlledValues, defineField, values, setValues } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    ...DefaultFormFanData,
    ...fanData.value,
    country: fanData.value?.deliveryAddressStructured?.country || '',
    addressLine1: fanData.value?.deliveryAddressStructured?.addressLine1 || '',
    addressLine2: fanData.value?.deliveryAddressStructured?.addressLine2 || '',
    city: fanData.value?.deliveryAddressStructured?.city || '',
    state: fanData.value?.deliveryAddressStructured?.state || '',
    postalCode: fanData.value?.deliveryAddressStructured?.postalCode || '',
    district: fanData.value?.deliveryAddressStructured?.district || '',
    subdistrict: fanData.value?.deliveryAddressStructured?.subdistrict || '',
    shirtSize: fanData.value?.shirtSize || '',
  },
});

// Form field definitions
const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [username, usernameAttrs] = defineField('username');
const [email, ___] = defineField('email');
const [phoneNumber, phoneNumberAttrs] = defineField('phoneNumber');
const [location, locationAttrs] = defineField('location');
const [birthDate, birthDateAttrs] = defineField('birthDate');
const [consentEmail, consentEmailAttrs] = defineField('consentEmail');
const [consentMessaging, consentMessagingAttrs] = defineField('consentMessaging');

// Address form field definitions
const [country] = defineField('country', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [addressLine1] = defineField('addressLine1', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [addressLine2] = defineField('addressLine2', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [city] = defineField('city', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [state] = defineField('state', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [postalCode] = defineField('postalCode', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [district] = defineField('district', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [subdistrict] = defineField('subdistrict', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});
const [addressShirtSize] = defineField('shirtSize', {
  validateOnModelUpdate: false,
  validateOnBlur: true,
});

//// Methods
const isLocationEqual = (a?: FanLocation, b?: FanLocation): boolean => {
  if (a === b) return true;
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.countryCode === b.countryCode &&
    a.city === b.city
  );
};

const resetErrorAndSuccess = () => {
  fanPatchError.value = null;
  fanPatchData.value = null;
};

const handleSignOut = () => {
  accountStore.logoutFan('Home');
};

const openEmailDialog = () => {
  if (!(isSubmitting.value || isFanFetching.value)) {
    isEmailPopoverOpen.value = true;
  }
};
const openAddressDialog = () => {
  isAddressDialogOpen.value = true;
};

// Address helper methods
const getGeolocationErrorMessage = () => {
  if (!geolocationError.value) return '';

  const errorType = geolocationError.value.type;

  const errorTypeMap = {
    PERMISSION_DENIED: 'permissionDenied',
    POSITION_UNAVAILABLE: 'positionUnavailable',
    TIMEOUT: 'timeout',
    NOT_SUPPORTED: 'notSupported',
  } as const;

  const errorKey = errorTypeMap[errorType] ?? 'generalError';

  return t(`addressForm.geolocationErrors.${errorKey}`);
};

const clearGeolocationError = () => {
  clearError();
};

const addAddressManually = () => {
  locationComboboxRef.value?.closeDropdown();
  showManualForm.value = true;
};

const getStatePlaceholder = () => {
  return t('addressForm.statePlaceholder');
};

const getPostalCodePlaceholder = () => {
  return t('addressForm.postalCodePlaceholder');
};

// LocationCombobox handlers
const onLocationChange = (location: FanLocation | undefined) => {
  if (!location) {
    setValues({
      country: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      district: '',
      subdistrict: '',
    });
    countryCode.value = '';
    showManualForm.value = true;
    selectedLocation.value = undefined;
    return;
  }

  selectedLocation.value = location;

  const basicAddress: FanAddress = {
    version: '2.0',
    addressLine1: location.addressLabel !== location.city ? location.addressLabel : '',
    addressLine2: '',
    city: location.city || '',
    country: '',
    countryCode: location.countryCode || '',
    state: location.county || '',
    stateCode: '',
    postalCode: location.postalCode || '',
    district: '',
    subdistrict: '',
    latitude: location.latitude,
    longitude: location.longitude,
    source: 'radar' as 'radar' | 'google' | 'manual',
    verified: false,
    formattedAddress: '',
  };

  if (location.countryCode) {
    const countryOption = countryOptions.find(
      (c: { code: string; name: string }) => c.code === location.countryCode,
    );
    if (countryOption) {
      basicAddress.country = countryOption.name;
      countryCode.value = location.countryCode;
    }
  }

  populateAddress(basicAddress);
};

const populateAddress = (address: FanAddress) => {
  if (!address.version || address.version < '2.0') {
    setValues({
      country: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      district: '',
      subdistrict: '',
    });
    countryCode.value = '';
  } else {
    setValues({
      country: address.country || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      district: address.district || '',
      subdistrict: address.subdistrict || '',
    });

    if (address.countryCode) {
      countryCode.value = address.countryCode;
    } else if (address.country) {
      const countryOption = countryOptions.find(
        (c: { code: string; name: string }) =>
          c.name.toLowerCase() === address.country?.toLowerCase(),
      );
      if (countryOption) {
        countryCode.value = countryOption.code;
      }
    }
  }
};

const onCountryChange = async () => {
  const countryOption = countryOptions.find(
    (c: { code: string; name: string }) => c.name === country.value,
  );
  countryCode.value = countryOption?.code || '';

  setValues({
    country: country.value,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    district: '',
    subdistrict: '',
  });

  await nextTick();
};

const createAddressData = (): FanAddress | null => {
  // Address source constants
  const addressSource = {
    radar: 'radar' as const,
    manual: 'manual' as const,
  } as const;

  // Base address properties that are common to both radar and manual entries
  const baseAddress = {
    version: '2.0',
    addressLine1: addressLine1.value || '',
    addressLine2: addressLine2.value || '',
    state: state.value || '',
    stateCode: '',
    postalCode: postalCode.value || '',
    district: district.value || '',
    subdistrict: subdistrict.value || '',
    verified: false,
    formattedAddress: '',
  };

  // Check if we have a selected location with city
  const hasValidLocation = selectedLocation.value?.city;

  if (hasValidLocation && selectedLocation.value) {
    return {
      ...baseAddress,
      city: selectedLocation.value.city || city.value || '',
      country: country.value || '',
      countryCode: selectedLocation.value.countryCode || countryCode.value || '',
      latitude: selectedLocation.value.latitude,
      longitude: selectedLocation.value.longitude,
      source: addressSource.radar,
    };
  }

  // Manual address entry
  return {
    ...baseAddress,
    city: city.value || '',
    country: country.value || '',
    countryCode: countryCode.value || '',
    latitude: undefined,
    longitude: undefined,
    source: addressSource.manual,
  };
};

const addAddressToPayload = (payload: { [key: string]: unknown }, addressData: FanAddress) => {
  addressData.formattedAddress = formatAddress({
    ...addressData,
    latitude: addressData.latitude || 0,
    longitude: addressData.longitude || 0,
  } as FanAddress);

  payload.deliveryAddressStructured = addressData;

  payload.deliveryAddress = [
    addressData.addressLine1,
    addressData.addressLine2,
    addressData.city,
    addressData.state,
    addressData.country,
    addressData.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
};

const closeAddressDialog = () => {
  isAddressDialogOpen.value = false;
};

const onFormSubmit = handleSubmit(async () => {
  const initial = { ...DefaultFormFanData, ...fanData.value };
  const current = controlledValues.value;
  const payload: { [key: string]: unknown } = {};

  // Handle user details fields (excluding address fields which are handled separately)
  (Object.keys(current) as (keyof FanUpdateData)[]).forEach((key) => {
    // Skip address-related fields as they're handled in the address dialog
    if (
      [
        'country',
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'postalCode',
        'district',
        'subdistrict',
        'shirtSize',
      ].includes(key as string)
    ) {
      return;
    }

    const initialValue = initial[key as keyof typeof initial];
    const currentValue = current[key as keyof typeof current];

    if (key === 'location' && (!collectFields.location || !isAuthenticated.value)) {
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

  // Handle address data if there are address changes
  const addressChanged = fanData.value?.deliveryAddressStructured
    ? country.value !== (fanData.value.deliveryAddressStructured.country || '') ||
      addressLine1.value !== (fanData.value.deliveryAddressStructured.addressLine1 || '') ||
      addressLine2.value !== (fanData.value.deliveryAddressStructured.addressLine2 || '') ||
      city.value !== (fanData.value.deliveryAddressStructured.city || '') ||
      state.value !== (fanData.value.deliveryAddressStructured.state || '') ||
      postalCode.value !== (fanData.value.deliveryAddressStructured.postalCode || '') ||
      district.value !== (fanData.value.deliveryAddressStructured.district || '') ||
      subdistrict.value !== (fanData.value.deliveryAddressStructured.subdistrict || '')
    : true;

  if (addressChanged) {
    const addressData = createAddressData();
    if (addressData && (addressData.addressLine1 || addressData.city || addressData.country)) {
      addAddressToPayload(payload, addressData);
    } else {
      // Clear address if it's empty
      payload.deliveryAddressStructured = null;
      payload.deliveryAddress = null;
    }
  }

  // Handle shirt size separately - always include if changed
  const shirtSizeChanged = addressShirtSize.value !== (fanData.value?.shirtSize || '');
  if (shirtSizeChanged) {
    payload.shirtSize = addressShirtSize.value;
  }

  // Submit the form data internally
  fanPatchData.value = null;
  fanPatchError.value = null;
  isSubmitting.value = true;
  await fanStore.fanPatch(payload as FanUpdateData);
  isSubmitting.value = false;
});

// Watchers for form updates
watch(
  () => fanData.value,
  (newValue) => {
    if (newValue) {
      // Exclude Fan.state (Record) - not used in this app
      const { state: _, ...fanWithoutState } = newValue;
      setValues(fanWithoutState);
    }
  },
  { immediate: true },
);

watch(values, () => resetErrorAndSuccess(), { deep: true });

// Address field error clearing watchers
watch(country, () => {
  if (errors.value.country) {
    errors.value.country = undefined;
  }
});
watch(addressLine1, () => {
  if (errors.value.addressLine1) {
    errors.value.addressLine1 = undefined;
  }
});
watch(city, () => {
  if (errors.value.city) {
    errors.value.city = undefined;
  }
});
watch(state, () => {
  if (errors.value.state) {
    errors.value.state = undefined;
  }
});
watch(postalCode, () => {
  if (errors.value.postalCode) {
    errors.value.postalCode = undefined;
  }
});
watch(district, () => {
  if (errors.value.district) {
    errors.value.district = undefined;
  }
});
watch(subdistrict, () => {
  if (errors.value.subdistrict) {
    errors.value.subdistrict = undefined;
  }
});
watch(addressShirtSize, () => {
  if (errors.value.shirtSize) {
    errors.value.shirtSize = undefined;
  }
});

// Address initialization watcher
watch(
  () => fanData.value?.deliveryAddressStructured,
  (newAddress) => {
    if (newAddress && Object.keys(newAddress).length > 0) {
      populateAddress(newAddress as FanAddress);
    }
  },
);

watch(
  () => fanData.value?.shirtSize,
  (newShirtSize) => {
    if (newShirtSize) {
      setValues({ shirtSize: newShirtSize });
    }
  },
);
</script>
