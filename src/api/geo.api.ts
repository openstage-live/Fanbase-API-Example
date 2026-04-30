import type { FanAddress } from '@/api/fan.api';
import { z } from 'zod';
import { apiService } from '@/api/api.service';
import { env } from '@/env';

const RadarAddressSchema = z.object({
  city: z.string().optional(),
  county: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  addressLabel: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
});

const RadarSchema = z.object({
  addresses: z.array(RadarAddressSchema),
});

const RadarDetailedAddressSchema = z
  .object({
    layer: z.string().optional(),
    formattedAddress: z.string().optional(),
    addressLabel: z.string().optional(),
    number: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    state: z.string().optional(),
    stateCode: z.string().optional(),
    country: z.string().optional(),
    countryCode: z.string().optional(),
    postalCode: z.string().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    streetAddress: z.string().optional(),
  })
  .loose();

const RadarDetailedAddressResponseSchema = z.object({
  addresses: z.array(RadarDetailedAddressSchema),
});

const GooglePredictionSchema = z.object({
  description: z.string(),
  place_id: z.string(),
});

const GoogleSchema = z.object({
  predictions: z.array(GooglePredictionSchema),
});

const GooglePlaceSchema = z.object({
  address_components: z.array(
    z
      .object({
        types: z.array(z.string()),
        long_name: z.string(),
        short_name: z.string(),
      })
      .loose(),
  ),
  geometry: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  formatted_address: z.string().optional(),
});

const GooglePlaceResponseSchema = z.object({
  result: GooglePlaceSchema,
});

const GooglePlacesResponseSchema = z.object({
  results: z.array(GooglePlaceSchema),
  status: z.string(),
});

type GooglePlace = z.infer<typeof GooglePlaceSchema>;
type GooglePrediction = z.infer<typeof GooglePredictionSchema>;
type RadarAddress = z.infer<typeof RadarAddressSchema>;
type RadarDetailedAddress = z.infer<typeof RadarDetailedAddressSchema>;

/**
 * Perform an API request to Radar's autocomplete/place search for the given search term
 * @param {String} query the value to search for
 * @param {Boolean} fallbackToGoogle a flag indicates wether to use Google Maps as a fallback service
 * @returns a list of address objects formatted (see formatRadarAddress)
 * @catch calls and @returns the result of the fallback or
 * @catch @returns the caught error if no fallback
 */
export const autoCompleteRadar = async (
  query: string,
  fallbackToGoogle = true,
  includeAddresses = false,
) => {
  const params = new URLSearchParams();
  params.set('query', String(query));
  params.append('layers', 'locality');

  if (includeAddresses) {
    params.append('layers', 'address');
  }

  try {
    const result = await apiService.request(
      {
        method: 'GET',
        url: 'https://api.radar.io/v1/search/autocomplete?' + params.toString(),
        headers: {
          Authorization: `${env.VITE_RADAR_KEY}`,
        },
      },
      RadarSchema,
    );

    if (!result.success) throw new Error('Could not get location from Radar!');

    return {
      items: result.data.addresses.map((adress) =>
        formatRadarAddress(adress, 'radar', includeAddresses),
      ),
      type: 'radar',
    };
  } catch (error) {
    if (fallbackToGoogle) {
      const fallback = await autoCompleteGoogle(query);
      return fallback;
    }
    throw error;
  }
};

/**
 * Perform an API request to Google's autocomplete/place search for the given search term
 * @param {String} query the value to search for
 * @returns a list of address prediction objects formatted (see formatGooglePrediction)
 * @catch @returns the caught error
 */
export const autoCompleteGoogle = async (query: string) => {
  const url =
    'https://maps.googleapis.com/maps/api/place/autocomplete/json?' +
    new URLSearchParams({
      input: String(query),
      radius: '500',
      key: env.VITE_GOOGLE_MAPS_API_KEY,
      types: '(cities)',
    });

  const result = await apiService.request({ method: 'GET', url }, GoogleSchema);

  if (!result.success) throw new Error('Could not get location from Google!');

  return {
    items: result.data.predictions.map((address) => formatGooglePrediction(address)),
    type: 'google',
  };
};

/**
 * Perform an API request to Google's /place/details for the given place_id (retirieved by autoCompleteGoogle)
 * @param {String} place_id the id of place to get details for
 * @returns a formatted location object with the needed fields
 * @catch @throws the caught error
 */
export const getPlaceDetailsGoogle = async (place_id: string) => {
  const url =
    'https://maps.googleapis.com/maps/api/place/details/json?' +
    new URLSearchParams({
      key: env.VITE_GOOGLE_MAPS_API_KEY,
      place_id,
      fields: 'address_components,geometry',
    });

  const result = await apiService.request({ method: 'GET', url }, GooglePlaceResponseSchema);
  if (!result.success) throw new Error('Could not get location from Google!');

  return formatGooglePlace(result.data.result);
};

/**
 * Formats a single Radar address object
 * @param {String} address the radar address object
 * @returns a formatted location object with the needed fields
 * @note the returned object already includes the needed location fields
 */
const formatRadarAddress = (address: RadarAddress, type = 'radar', includeAddresses = false) => {
  let label = '';
  if (address.city) {
    label += address.city;
  }
  if (address.county) {
    label += label.length > 0 ? ', ' + address.county : address.county;
  } else if (address.state) {
    label += label.length > 0 ? ', ' + address.state : address.state;
  }
  label += label.length > 0 ? ', ' + address.country : address.country;

  if (includeAddresses && address.addressLabel) {
    label += label.length > 0 ? ', ' + address.addressLabel : address.addressLabel;
  }
  const location = {
    label: label,
    location: [address.latitude, address.longitude],
    city: address.city || null,
    addressLabel: address.addressLabel || null,
    state: address.state || null,
    county: address.county || null,
    country: address.country || null,
    countryCode: address.countryCode || null,
    latitude: address.latitude || null,
    longitude: address.longitude || null,
    postalCode: address.postalCode || null,
    type,
  };
  return location;
};

/**
 * Formats a single Google address prediction object
 * @param {String} place the google location prediction object
 * @returns a formatted location object with the needed fields
 * @note the returned object does NOT include the needed location fields yet, only label and place_id
 * @note location fields to be retreived at the time of selection using @method formatGooglePlace
 */
const formatGooglePrediction = (place: GooglePrediction, type = 'google') => {
  return {
    label: place.description,
    place_id: place.place_id,
    type,
  };
};

/**
 * Formats a single Google place object
 * @param {String} place the google place object
 * @returns a formatted location object with the needed fields
 */
const formatGooglePlace = (place: GooglePlace, type = 'google') => {
  const location = {
    city: findComponent(place.address_components, 'postal_town', 'long_name'),
    country: findComponent(place.address_components, 'country', 'long_name'),
    state: findComponent(place.address_components, 'administrative_area_level_1', 'long_name'),
    countryCode: findComponent(place.address_components, 'country', 'short_name'),
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    type,
  };
  return location;
};
const findComponent = (address_components: unknown, type: string, field: string) => {
  if (!address_components) return null;
  for (const address_component of address_components as Array<unknown>) {
    for (const address_component_type of (address_component as { types: string[] }).types) {
      if (address_component_type == type) {
        return (address_component as { [key: string]: string })[field];
      }
    }
  }
  return null;
};

/**
 * Reverse geocodes a location, converting coordinates to address.
 * Perform an API request to Radar's /geocode/reverse for the given location coordinates
 * @param {String} coordinates the location coordinates to look up in the format: {lat: float, lng: float}
 * @param {Boolean} fallbackToGoogle a flag indicates wether to use Google Maps as a fallback service
 * @returns a single address object formatted (see formatRadarAddress)
 * @catch calls and @returns the result of the fallback function or
 * @catch @returns the caught error if no fallback
 */
export const reverseGeoCodingRadar = async (
  coordinates: { lat: unknown; lng: unknown },
  fallbackToGoogle = false,
) => {
  try {
    if (!coordinates) throw new Error('No coordinates found');

    const params = new URLSearchParams();
    params.set('coordinates', `${coordinates.lat},${coordinates.lng}`);
    const layers = ['address', 'neighborhood', 'postalCode', 'locality', 'country', 'state'];
    layers.forEach((layer) => params.append('layers', layer));

    const result = await apiService.request(
      {
        method: 'GET',
        url: 'https://api.radar.io/v1/geocode/reverse?' + params.toString(),
        headers: {
          Authorization: `${env.VITE_RADAR_KEY}`,
        },
      },
      RadarSchema,
    );
    if (!result.success) throw new Error('Could not reverse-geocode using Radar!');
    const radarAddress = result.data.addresses[0];
    if (!radarAddress) throw new Error('Could not reverse-geocode using Radar!');
    return formatRadarAddress(radarAddress, 'autodetect-radar');
  } catch (error) {
    if (fallbackToGoogle) {
      const fallback = await reverseGeoCodingGoogle(coordinates);
      return fallback;
    }
    throw error;
  }
};

/**
 * Reverse geocodes a location, converting coordinates to address.
 * Perform an API request to Google's geocoding API for the given location coordinates
 * @param {String} coordinates the location coordinates to look up in the format: {lat: float, lng: float}
 * @param {Boolean} fallbackToGoogle a flag indicates wether to use Google Maps as a fallback service
 * @returns a single address object formatted (see formatRadarAddress)
 * @catch @returns the caught error
 */
export const reverseGeoCodingGoogle = async (coordinates: { lat: unknown; lng: unknown }) => {
  if (!coordinates) throw new Error('No coordinates found');
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?' +
    new URLSearchParams({
      key: env.VITE_GOOGLE_MAPS_API_KEY,
      latlng: `${coordinates.lat},${coordinates.lng}`,
      types: '(cities)',
    });
  const result = await apiService.request({ method: 'GET', url }, GooglePlacesResponseSchema);
  if (!result.success || result.data.status !== 'OK')
    throw new Error('Could not reverse-geocode using Google!');
  const googleAddress = result.data.results[0];
  if (!googleAddress) throw new Error('Could not reverse-geocode using Google!');
  return formatGooglePlace(googleAddress, 'autodetect-google');
};

/**
 * Enhanced geocoding for detailed address information using Radar API
 * @param coordinates Location coordinates to reverse geocode
 * @param fallbackToGoogle Whether to use Google as fallback
 * @returns Enhanced address information suitable for international addresses
 */
export const getDetailedAddressRadar = async (
  coordinates: { lat: number; lng: number },
  fallbackToGoogle = true,
): Promise<FanAddress> => {
  try {
    const params = new URLSearchParams();
    params.set('coordinates', `${coordinates.lat},${coordinates.lng}`);
    // Request all possible layers for detailed address information
    const layers = [
      'address',
      'neighborhood',
      'postalCode',
      'locality',
      'county',
      'state',
      'country',
    ];
    layers.forEach((layer) => params.append('layers', layer));

    const result = await apiService.request(
      {
        method: 'GET',
        url: 'https://api.radar.io/v1/geocode/reverse?' + params.toString(),
        headers: {
          Authorization: `${env.VITE_RADAR_KEY}`,
        },
      },
      RadarDetailedAddressResponseSchema,
    );

    if (!result.success || !result.data.addresses || result.data.addresses.length === 0) {
      throw new Error('No address found');
    }

    return formatRadarDetailedAddress(result.data.addresses, coordinates);
  } catch (error) {
    if (fallbackToGoogle) {
      return await getDetailedAddressGoogle(coordinates);
    }
    throw error;
  }
};

/**
 * Enhanced geocoding for detailed address information using Google API
 * @param coordinates Location coordinates to reverse geocode
 * @returns Enhanced address information suitable for international addresses
 */
export const getDetailedAddressGoogle = async (coordinates: {
  lat: number;
  lng: number;
}): Promise<FanAddress> => {
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?' +
    new URLSearchParams({
      latlng: `${coordinates.lat},${coordinates.lng}`,
      key: env.VITE_GOOGLE_MAPS_API_KEY,
      result_type: 'street_address|premise|subpremise',
    });

  const result = await apiService.request({ method: 'GET', url }, GooglePlacesResponseSchema);

  if (
    !result.success ||
    !result.data.results ||
    result.data.results.length === 0 ||
    !result.data.results[0]
  ) {
    throw new Error('No address found');
  }

  return formatGoogleDetailedAddress(result.data.results[0], coordinates);
};

/**
 * Format Radar geocoding response into FanAddress structure
 * Uses API response structure to dynamically determine address hierarchy
 */
const formatRadarDetailedAddress = (
  addresses: Array<RadarDetailedAddress>,
  coordinates: { lat: number; lng: number },
): FanAddress => {
  // Create a map of address components by layer for easy access
  const componentsByLayer = new Map<string, (typeof addresses)[0]>();
  addresses.forEach((addr) => {
    if (addr.layer) {
      componentsByLayer.set(addr.layer, addr);
    }
  });

  // Get the most specific address data (first item) as fallback
  const primaryAddress = addresses[0];

  // Extract components using layer-based approach
  const getComponent = (layers: string[], field?: string): string => {
    for (const layer of layers) {
      const component = componentsByLayer.get(layer);
      if (component) {
        if (field && component[field]) {
          return String(component[field]);
        }
        // If no specific field requested, try common field names
        if (!field) {
          const value = component.name || component.value || component[layer];
          if (value) return String(value);
        }
      }
    }
    return '';
  };

  // Build street address using API structure
  const buildStreetAddress = (): string => {
    const addressComponent = componentsByLayer.get('address');

    if (addressComponent) {
      // Try structured approach first
      const number = addressComponent.number || addressComponent.streetNumber || '';
      const street = addressComponent.street || addressComponent.streetName || '';

      if (number && street) {
        return `${number} ${street}`;
      }

      // Try other address fields
      if (addressComponent.addressLabel) return addressComponent.addressLabel;
      if (addressComponent.name) return addressComponent.name;
      if (addressComponent.address) return addressComponent.address;
      if (addressComponent.streetAddress) return addressComponent.streetAddress;
    }

    // Fallback to primary address fields
    return primaryAddress?.address || primaryAddress?.streetAddress || primaryAddress?.street || '';
  };

  // Determine administrative hierarchy dynamically
  const getAdministrativeHierarchy = () => {
    // Check what administrative levels are available
    const country = getComponent(['country'], 'country') || primaryAddress?.country || '';
    const countryCode =
      getComponent(['country'], 'countryCode') || primaryAddress?.countryCode || '';

    // Get state/province/region and county data
    const rawState = getComponent(['state'], 'state') || primaryAddress?.state || '';
    const stateCode = getComponent(['state'], 'stateCode') || primaryAddress?.stateCode || '';
    const rawCounty = getComponent(['county'], 'county') || primaryAddress?.county || '';

    let state = '';
    let district = '';

    if (countryCode === 'GB') {
      // For UK: County is the main subdivision (state), don't store constituent country
      state = rawCounty; // County (e.g., Staffordshire)
      district = ''; // Don't store England/Scotland/Wales/NI - not typically needed
    } else {
      // For other countries: Use standard hierarchy
      state = rawState;
      district = rawCounty;

      // Dynamic hierarchy adjustment for countries where county is primary
      if (!state && district) {
        const countyAsStateCountries = ['IE']; // Ireland (removed GB since we handle it above)
        if (countyAsStateCountries.includes(countryCode)) {
          state = district;
          district = ''; // Avoid duplication
        }
      }
    }

    return { country, countryCode, state, stateCode, district };
  };

  const addressLine1 = buildStreetAddress();
  const { country, countryCode, state, stateCode, district } = getAdministrativeHierarchy();

  // Get other components
  const city = getComponent(['locality'], 'city') || primaryAddress?.city || '';
  const postalCode = getComponent(['postalCode'], 'postalCode') || primaryAddress?.postalCode || '';
  const subdistrict = getComponent(['neighborhood'], 'neighborhood') || '';

  // Use API's formatted address if available, otherwise build one
  const formattedAddress =
    primaryAddress?.formattedAddress ||
    [addressLine1, city, state, country].filter(Boolean).join(', ');

  return {
    addressLine1,
    addressLine2: '', // Radar doesn't typically provide unit/apt info in reverse geocoding
    city,
    country,
    countryCode,
    state,
    stateCode,
    postalCode,
    district,
    subdistrict,
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    formattedAddress,
    source: 'radar',
    verified: true,
  };
};

/**
 * Format Google geocoding response into FanAddress structure
 * Uses Google's address_components to dynamically determine address hierarchy
 */
const formatGoogleDetailedAddress = (
  result: GooglePlace,
  coordinates: { lat: number; lng: number },
): FanAddress => {
  const components = result.address_components || [];

  // Create a map of component types to their values for efficient lookup
  const componentMap = new Map<string, { long_name: string; short_name: string }>();
  components.forEach((component) => {
    component.types.forEach((type) => {
      componentMap.set(type, {
        long_name: component.long_name,
        short_name: component.short_name,
      });
    });
  });

  const getComponent = (
    types: string[],
    field: 'long_name' | 'short_name' = 'long_name',
  ): string => {
    for (const type of types) {
      const component = componentMap.get(type);
      if (component && component[field]) {
        return component[field];
      }
    }
    return '';
  };

  // Build street address
  const streetNumber = getComponent(['street_number']);
  const streetName = getComponent(['route']);
  const addressLine1 = [streetNumber, streetName].filter(Boolean).join(' ');

  // Build address line 2 (apartment, suite, etc.)
  const addressLine2 = getComponent(['subpremise', 'floor', 'unit']);

  // Determine city using Google's hierarchy
  // Priority: locality > postal_town > administrative_area_level_2
  const city =
    getComponent(['locality']) ||
    getComponent(['postal_town']) ||
    getComponent(['administrative_area_level_2']);

  // Country information
  const country = getComponent(['country']);
  const countryCode = getComponent(['country'], 'short_name');

  // Determine state/province/region dynamically based on country
  let state = '';
  let stateCode = '';
  let district = '';

  if (countryCode === 'GB') {
    // For UK: Use county (admin_level_2) as state, don't store constituent country
    state = getComponent(['administrative_area_level_2']); // County (e.g., Staffordshire)
    stateCode = getComponent(['administrative_area_level_2'], 'short_name');
    district = ''; // Don't store England/Scotland/Wales/NI - not typically needed
  } else {
    // For other countries: Use standard hierarchy
    state = getComponent(['administrative_area_level_1']);
    stateCode = getComponent(['administrative_area_level_1'], 'short_name');

    // Determine district/county dynamically
    // This varies by country - could be administrative_area_level_2 or _level_3
    // Skip if it's the same as city to avoid duplication
    district = getComponent(['administrative_area_level_2']);
    if (district === city) {
      district = getComponent(['administrative_area_level_3']);
    }
    if (district === city) {
      district = ''; // Avoid duplication
    }
  }

  // Subdistrict/neighborhood
  const subdistrict = getComponent(['sublocality', 'sublocality_level_1', 'neighborhood']);

  // Postal code
  const postalCode = getComponent(['postal_code']);

  // Additional validation: ensure we don't have duplicate values
  const validateAndClean = () => {
    const result = {
      addressLine1,
      addressLine2,
      city,
      country,
      countryCode,
      state,
      stateCode,
      postalCode,
      district,
      subdistrict,
    };

    // Clean up duplicates between district and other fields
    if (result.district === result.state || result.district === result.city) {
      result.district = '';
    }

    // Clean up duplicates between subdistrict and other fields
    if (result.subdistrict === result.city || result.subdistrict === result.district) {
      result.subdistrict = '';
    }

    return result;
  };

  const cleanedAddress = validateAndClean();

  return {
    ...cleanedAddress,
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    formattedAddress: result.formatted_address || '',
    source: 'google',
    verified: true,
  };
};

/**
 * Countries that typically have state/province/region subdivisions
 */
export const COUNTRIES_WITH_STATES = [
  'US', // United States - States
  'CA', // Canada - Provinces/Territories
  'AU', // Australia - States/Territories
  'GB', // United Kingdom - Counties
  'DE', // Germany - States (Bundesländer)
  'FR', // France - Regions
  'JP', // Japan - Prefectures
  'IN', // India - States
  'BR', // Brazil - States
  'MX', // Mexico - States
  'AR', // Argentina - Provinces
  'IT', // Italy - Regions
  'ES', // Spain - Autonomous Communities
  'RU', // Russia - Federal Subjects
  'CN', // China - Provinces
];

/**
 * Countries that do not use postal/ZIP codes
 */
export const COUNTRIES_WITHOUT_POSTAL_CODES = [
  'AO', // Angola
  'AG', // Antigua and Barbuda
  'AW', // Aruba
  'BS', // Bahamas
  'BZ', // Belize
  'BJ', // Benin
  'BW', // Botswana
  'BF', // Burkina Faso
  'BI', // Burundi
  'CM', // Cameroon
  'CF', // Central African Republic
  'KM', // Comoros
  'CG', // Republic of the Congo
  'CD', // Democratic Republic of the Congo
  'CK', // Cook Islands
  'CI', // Ivory Coast
  'DJ', // Djibouti
  'DM', // Dominica
  'GQ', // Equatorial Guinea
  'ER', // Eritrea
  'FJ', // Fiji
  'GM', // Gambia
  'GH', // Ghana
  'GD', // Grenada
  'GY', // Guyana
  'HK', // Hong Kong
  'JM', // Jamaica
  'KI', // Kiribati
  'LY', // Libya
  'MO', // Macao
  'MW', // Malawi
  'ML', // Mali
  'MR', // Mauritania
  'MU', // Mauritius
  'MS', // Montserrat
  'NR', // Nauru
  'NU', // Niue
  'QA', // Qatar
  'RW', // Rwanda
  'KN', // Saint Kitts and Nevis
  'LC', // Saint Lucia
  'ST', // São Tomé and Príncipe
  'SC', // Seychelles
  'SL', // Sierra Leone
  'SB', // Solomon Islands
  'SO', // Somalia
  'SR', // Suriname
  'SZ', // Eswatini
  'TL', // East Timor
  'TK', // Tokelau
  'TO', // Tonga
  'TV', // Tuvalu
  'UG', // Uganda
  'AE', // United Arab Emirates
  'VU', // Vanuatu
  'YE', // Yemen
  'ZW', // Zimbabwe
];

/**
 * Countries that commonly use district/subdistrict addressing
 */
export const COUNTRIES_WITH_DISTRICTS = [
  'TH', // Thailand
  'ID', // Indonesia
  'MY', // Malaysia
  'PH', // Philippines
  'VN', // Vietnam
  'KR', // South Korea
  'JP', // Japan
  'CN', // China
  'TW', // Taiwan
  'IN', // India
  'BD', // Bangladesh
  'PK', // Pakistan
  'LK', // Sri Lanka
];

/**
 * Get a comprehensive list of countries supported by geocoding APIs
 * This is a curated list covering all major countries with ISO codes
 * @returns Array of country objects with code and name
 */
export const getSupportedCountries = (): Array<{ code: string; name: string }> => {
  return [
    { code: 'AD', name: 'Andorra' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AL', name: 'Albania' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AO', name: 'Angola' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'AT', name: 'Austria' },
    { code: 'AU', name: 'Australia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AX', name: 'Åland Islands' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BI', name: 'Burundi' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BL', name: 'Saint Barthélemy' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BN', name: 'Brunei' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BQ', name: 'Caribbean Netherlands' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BV', name: 'Bouvet Island' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BZ', name: 'Belize' },
    { code: 'CA', name: 'Canada' },
    { code: 'CC', name: 'Cocos Islands' },
    { code: 'CD', name: 'Democratic Republic of the Congo' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'CG', name: 'Republic of the Congo' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'CI', name: 'Ivory Coast' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CL', name: 'Chile' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'CW', name: 'Curaçao' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DE', name: 'Germany' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EE', name: 'Estonia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'EH', name: 'Western Sahara' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'ES', name: 'Spain' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FI', name: 'Finland' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FK', name: 'Falkland Islands' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GE', name: 'Georgia' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'GG', name: 'Guernsey' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'GR', name: 'Greece' },
    { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GU', name: 'Guam' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HM', name: 'Heard Island and McDonald Islands' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HR', name: 'Croatia' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HU', name: 'Hungary' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'IN', name: 'India' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IR', name: 'Iran' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IT', name: 'Italy' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JO', name: 'Jordan' },
    { code: 'JP', name: 'Japan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KM', name: 'Comoros' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'KP', name: 'North Korea' },
    { code: 'KR', name: 'South Korea' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LY', name: 'Libya' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MD', name: 'Moldova' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MF', name: 'Saint Martin' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'ML', name: 'Mali' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'MO', name: 'Macao' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MT', name: 'Malta' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'MV', name: 'Maldives' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MX', name: 'Mexico' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NE', name: 'Niger' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NU', name: 'Niue' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'OM', name: 'Oman' },
    { code: 'PA', name: 'Panama' },
    { code: 'PE', name: 'Peru' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PL', name: 'Poland' },
    { code: 'PM', name: 'Saint Pierre and Miquelon' },
    { code: 'PN', name: 'Pitcairn' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'PS', name: 'Palestine' },
    { code: 'PT', name: 'Portugal' },
    { code: 'PW', name: 'Palau' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RE', name: 'Réunion' },
    { code: 'RO', name: 'Romania' },
    { code: 'RS', name: 'Serbia' },
    { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SE', name: 'Sweden' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SH', name: 'Saint Helena' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SM', name: 'San Marino' },
    { code: 'SN', name: 'Senegal' },
    { code: 'SO', name: 'Somalia' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ST', name: 'São Tomé and Príncipe' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'SX', name: 'Sint Maarten' },
    { code: 'SY', name: 'Syria' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TD', name: 'Chad' },
    { code: 'TF', name: 'French Southern Territories' },
    { code: 'TG', name: 'Togo' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TL', name: 'East Timor' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VG', name: 'British Virgin Islands' },
    { code: 'VI', name: 'U.S. Virgin Islands' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'WF', name: 'Wallis and Futuna' },
    { code: 'WS', name: 'Samoa' },
    { code: 'YE', name: 'Yemen' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' },
  ].sort((a, b) => a.name.localeCompare(b.name));
};
