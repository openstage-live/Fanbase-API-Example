<template>
  <div class="input-wrapper">
    <Label
      class="z-10 w-max translate-y-1 scale-75 rounded-tl-lg rounded-tr-lg bg-white px-2 text-sm"
      :variant="variant === 'ghost' ? 'ghost' : 'default'"
      :for="name"
      >{{ label }}</Label
    >
    <Combobox v-model="selectedLocation" by="label" :ignore-filter="true" :model:open="isOpen">
      <ComboboxAnchor>
        <div ref="inputContainerRef" class="relative w-full items-center">
          <ComboboxInput
            v-model="search"
            class="pl-9"
            :display-value="(val) => val?.label ?? ''"
            :placeholder="placeholder"
            :class="loadingCurrentLocation && 'pointer-events-none opacity-60'"
            :disabled="disabled"
            @input="handleSearchInput"
          />
          <span class="absolute inset-y-0 start-0 flex items-center justify-center px-3">
            <Search class="size-5 stroke-black" />
          </span>
          <span class="absolute inset-y-0 end-0 flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              class="z-10 mr-2 rounded-l-none border-none px-0 hover:bg-white/5"
              @click="getCurrentLocation()"
              :disabled="disabled"
            >
              <Loader2 v-if="loadingCurrentLocation" class="size-5 animate-spin stroke-black" />
              <MapPin v-else class="size-5 cursor-pointer" />
            </Button>
          </span>
        </div>
      </ComboboxAnchor>

      <ComboboxList class="-mt-1" :style="{ width: inputWidth }">
        <ComboboxEmpty v-if="shouldShowContent">
          {{ emptyMessage }}
        </ComboboxEmpty>
        <div
          v-if="isSearching || !isDebounceComplete"
          class="absolute bottom-0 left-0 z-10 flex w-full items-center justify-center gap-x-1 bg-white py-4"
        >
          <div class="flex items-center justify-center gap-x-1">
            <span class="font-Matter-Medium text-sm">Loading...</span>
            <Loader2 class="h-4 w-4 animate-spin stroke-black" />
          </div>
        </div>
        <ComboboxGroup :class="$slots.dropdownBottom ? 'pb-12' : ''">
          <ComboboxItem v-for="item in items" :key="JSON.stringify(item.location)" :value="item">
            {{ item.label }}
            <ComboboxItemIndicator>
              <Check :class="cn('ml-auto h-4 w-4 stroke-black')" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxGroup>

        <transition name="fade">
          <div
            v-if="$slots.dropdownBottom && shouldShowContent"
            class="absolute bottom-0 left-0 flex w-full items-center justify-center border-t border-black/10 bg-white py-2"
          >
            <slot name="dropdownBottom" />
          </div>
        </transition>
      </ComboboxList>
    </Combobox>

    <!-- Error message display -->
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/utils/common';
import { ref, watch, computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { FanLocation } from '@/api/fan.api';
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from '@ui/combobox';
import Button from '@ui/button/Button.vue';
import {
  autoCompleteRadar as autoComplete,
  getPlaceDetailsGoogle,
  reverseGeoCodingRadar as reverseGeoCoding,
} from '@api/geo.api';
import { useTranslation } from '@/locales/i18n';
import { Check, Loader2 } from 'lucide-vue-next';
import Label from '@ui/label/Label.vue';
import { type LabelVariants } from '@ui/label/index';
import { useGeolocation } from '@composables/useGeolocation';

import { Search, MapPin } from 'lucide-vue-next';

interface LocationComboboxProps {
  label: string;
  name: string;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  variant?: LabelVariants['variant'];
  modelValue?: FanLocation;
  withAddress?: boolean;
}

const props = withDefaults(defineProps<LocationComboboxProps>(), {
  placeholder: 'Search for a location...',
  emptyMessage: 'No locations found',
  disabled: false,
  variant: 'default',
  modelValue: undefined,
  withAddress: false,
});

interface LocationItem {
  label?: string;
  addressLabel?: string;
  postalCode?: string | null;
  location: [number, number];
  city: string | null;
  state: string | null;
  county: string | null;
  country: string | null;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  type: 'radar' | 'google' | 'autodetect';
}

interface LocationPrediction extends LocationItem {
  place_id?: string;
}

const emit = defineEmits<{
  'update:modelValue': [value: FanLocation | undefined];
  change: [value: FanLocation | undefined];
}>();

const { t } = useTranslation();
const { getCurrentCoordinates, geolocationError, clearError } = useGeolocation();

const error = ref('');
const search = ref('');
const isSearching = ref(false);
const isOpen = ref(false);
const items = ref<LocationItem[]>([]);
const locationServiceEnabled = ref(true);
const selectedLocationPrediction = ref<LocationPrediction | null>(null);
const selectedLocation = ref<LocationPrediction | null>(null);
const loadingCurrentLocation = ref(false);
const inputContainerRef = ref<HTMLElement | null>(null);
const isDebounceComplete = ref(false);
const inputWidth = ref('100%');

// Computed
const shouldShowContent = computed(() => !isSearching.value && isDebounceComplete.value);

// Watchers
watch(
  inputContainerRef,
  (newRef) => {
    if (newRef) {
      inputWidth.value = `${newRef.offsetWidth}px`;
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Create a display label from the location data
      const parts = [newValue.city, newValue.countryCode].filter(Boolean);
      const displayLabel = parts.length > 0 ? parts.join(', ') : 'Selected Location';

      if (search.value !== displayLabel) {
        search.value = displayLabel;
      }
    } else {
      search.value = '';
    }
  },
  { immediate: true },
);

watch(selectedLocation, (newLocation) => {
  if (newLocation) {
    const locationValue: FanLocation = {
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      city: newLocation.city || undefined,
      county: newLocation.county || undefined,
      country: newLocation.country || undefined,
      countryCode: newLocation.countryCode || undefined,
      state: newLocation.state || undefined,
      postalCode: newLocation.postalCode || undefined,
      addressLabel: newLocation.addressLabel || undefined,
    };
    emit('update:modelValue', locationValue);
    search.value = '';
    closeDropdown();
  } else {
    emit('update:modelValue', undefined);
  }
});

// Methods

const resetSearchState = (closeDropdownOnReset = true) => {
  items.value = [];
  selectedLocationPrediction.value = null;
  isSearching.value = false;
  isDebounceComplete.value = true;
  if (closeDropdownOnReset) {
    isOpen.value = false;
  }
};

const searchQueryChange = async () => {
  if (!search.value.length) {
    resetSearchState();
    return;
  }

  // Always call autocomplete for new searches
  if (
    !selectedLocationPrediction.value ||
    search.value !== selectedLocationPrediction.value.label
  ) {
    callAutoComplete(search.value);
    return;
  }

  // Handle selection logic without clearing search
  if (selectedLocationPrediction.value?.type === 'radar') {
    selectedLocation.value = { ...selectedLocationPrediction.value };
    return;
  }

  if (
    selectedLocationPrediction.value?.type === 'google' &&
    selectedLocationPrediction.value?.place_id
  ) {
    const location = await getGoogleLocationDetails(selectedLocationPrediction.value.place_id);
    selectedLocation.value = {
      ...location,
      label: selectedLocationPrediction.value.label,
    } as LocationItem;
    return;
  }

  if (
    selectedLocationPrediction.value &&
    ['autodetect', 'autodetect-radar', 'autodetect-google'].includes(
      selectedLocationPrediction.value.type,
    )
  ) {
    selectedLocation.value = { ...selectedLocationPrediction.value };
    return;
  }
};

const debouncedSearchQueryChange = useDebounceFn(searchQueryChange, 300);

const handleSearchInput = () => {
  isDebounceComplete.value = false;
  debouncedSearchQueryChange();
};

const callAutoComplete = async (searchTerm: string) => {
  isSearching.value = true;
  try {
    const response = await autoComplete(searchTerm, true, props.withAddress);
    if (['google', 'radar'].includes(response.type)) {
      items.value = (response.items || []) as LocationItem[];
      isSearching.value = false;
    } else {
      items.value = [];
      isSearching.value = false;
    }
  } catch (err) {
    console.error('AutoComplete error:', err);
    error.value = 'Location service error';
    locationServiceEnabled.value = false;
    items.value = [];
    isSearching.value = false;
  } finally {
    // Mark debounce as complete when search finishes
    isDebounceComplete.value = true;
  }
};

const getGoogleLocationDetails = async (place_id: string) => {
  loadingCurrentLocation.value = true;
  try {
    const location = await getPlaceDetailsGoogle(place_id);
    loadingCurrentLocation.value = false;
    return location;
  } catch (error) {
    (error as { value: string }).value = 'Location service error';
    locationServiceEnabled.value = false;
  }
  loadingCurrentLocation.value = false;
  return null;
};

const getCurrentLocation = async () => {
  loadingCurrentLocation.value = true;
  error.value = '';

  clearError();
  closeDropdown();

  try {
    const coordinates = await getCurrentCoordinates({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    await getCurrentLocationSuccess(coordinates);
  } catch {
    getCurrentLocationError();
  }
};

const getCurrentLocationSuccess = async (coordinates: { latitude: number; longitude: number }) => {
  const coords = {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
  };

  let location: LocationPrediction = {
    latitude: coords.lat,
    longitude: coords.lng,
    label: 'Location Detected',
    addressLabel: 'Location Detected',
    city: null,
    state: null,
    country: null,
    county: null,
    postalCode: null,
    countryCode: null,
    location: [coords.lat, coords.lng],
    type: 'radar',
  };

  try {
    const resp = await reverseGeoCoding(coords, true);

    location = {
      ...location,
      latitude: Number(resp.latitude),
      longitude: Number(resp.longitude),
      city: resp.city ?? null,
      addressLabel: 'addressLabel' in resp ? (resp.addressLabel as string) : undefined,
      country: resp.country ?? null,
      state: resp.state ?? null,
      county: 'county' in resp ? resp.county : null,
      countryCode: (resp.countryCode as string) ?? null,
      postalCode: 'postalCode' in resp ? (resp.postalCode as string) : null,
      type: (resp.type as 'radar' | 'google' | 'autodetect') ?? 'autodetect',
      location: [Number(resp.latitude), Number(resp.longitude)],
    };

    if (resp.city && resp.country) {
      location.label = `${resp.city}, ${resp.country}`;
    } else if (resp.city) {
      location.label = resp.city;
    } else if (resp.country) {
      location.label = resp.country;
    } else if (resp.state) {
      location.label = resp.state;
    } else if ('addressLabel' in resp && resp.addressLabel) {
      location.label = resp.addressLabel as string;
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
  } finally {
    selectedLocationPrediction.value = { ...location };
    items.value = [{ ...location }];
    search.value = location.label ?? '';
    selectedLocation.value = location;
    loadingCurrentLocation.value = false;
  }
};

const getCurrentLocationError = () => {
  if (geolocationError.value) {
    switch (geolocationError.value.type) {
      case 'PERMISSION_DENIED':
        error.value = t('input.location.failedToDetectLocation');
        break;
      case 'NOT_SUPPORTED':
        error.value = t('input.label.geolocationNotSupported');
        break;
      default:
        error.value = t('input.location.locationError');
        break;
    }
  } else {
    error.value = t('input.location.locationError');
  }
  loadingCurrentLocation.value = false;
};

const closeDropdown = () => {
  isOpen.value = false;
};

defineExpose({
  closeDropdown,
});
</script>
