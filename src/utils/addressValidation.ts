import type { FanAddress } from '@/api/fan.api';

/**
 * API-driven address validation and formatting utilities
 * Leverages address structure from geocoding APIs instead of hardcoded country rules
 */

/**
 * Basic country information for essential validations only
 * Reduced from extensive country configs to minimal requirements
 */
export interface CountryInfo {
  code: string;
  name: string;
  postalCodePattern?: RegExp;
}

/**
 * Address field configuration determined dynamically from API responses
 */
export interface AddressFieldConfig {
  isRequired: boolean;
  label: string;
  isSupported: boolean;
}

/**
 * Minimal country information for essential validations only
 * Focuses on postal code patterns and basic labels - everything else is API-driven
 */
export const BASIC_COUNTRY_INFO: Record<string, CountryInfo> = {
  US: {
    code: 'US',
    name: 'United States',
    postalCodePattern: /^\d{5}(-\d{4})?$/,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    postalCodePattern: /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i,
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    postalCodePattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    postalCodePattern: /^\d{4}$/,
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    postalCodePattern: /^\d{5}$/,
  },
  FR: {
    code: 'FR',
    name: 'France',
    postalCodePattern: /^\d{5}$/,
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    postalCodePattern: /^\d{3}-\d{4}$/,
  },
  // Add more countries as needed - but only basic info, not complex formatting rules
};

/**
 * Get basic country information (minimal data only)
 */
export function getCountryInfo(countryCode: string): CountryInfo | null {
  return BASIC_COUNTRY_INFO[countryCode.toUpperCase()] || null;
}

/**
 * Analyze address structure to determine field configuration dynamically
 * This replaces hardcoded country configs with API-driven field detection
 */
export function analyzeAddressStructure(address: FanAddress): Record<string, AddressFieldConfig> {
  const config: Record<string, AddressFieldConfig> = {};

  // Determine field requirements based on what the API provided
  // If API returned a value, it's likely supported and potentially required

  config.addressLine1 = {
    isRequired: true, // Always required
    label: 'Street Address',
    isSupported: true,
  };

  config.addressLine2 = {
    isRequired: false, // Never required
    label: 'Apartment, Suite, etc.',
    isSupported: true,
  };

  config.city = {
    isRequired: true, // Always required
    label: 'City',
    isSupported: true,
  };

  config.country = {
    isRequired: true, // Always required
    label: 'Country',
    isSupported: true,
  };

  // Dynamic fields based on API response
  config.state = {
    isRequired: Boolean(address.state), // Required if API provided it
    label: getStateLabel(address.countryCode || ''),
    isSupported: Boolean(address.state),
  };

  config.postalCode = {
    isRequired: Boolean(address.postalCode), // Required if API provided it
    label: getPostalCodeLabel(address.countryCode || ''),
    isSupported: Boolean(address.postalCode),
  };

  config.district = {
    isRequired: false, // Usually optional
    label: getDistrictLabel(address.countryCode || ''),
    isSupported: Boolean(address.district),
  };

  config.subdistrict = {
    isRequired: false, // Usually optional
    label: 'Subdistrict',
    isSupported: Boolean(address.subdistrict),
  };

  return config;
}

/**
 * Get appropriate state/region label for country
 */
function getStateLabel(countryCode: string): string {
  switch (countryCode) {
    case 'US':
      return 'State';
    case 'CA':
      return 'Province';
    case 'AU':
      return 'State/Territory';
    case 'GB':
      return 'County';
    case 'DE':
      return 'State';
    case 'FR':
      return 'Region';
    case 'JP':
      return 'Prefecture';
    default:
      return 'State/Province';
  }
}

/**
 * Validate postal code for a specific country
 * Now uses minimal country info instead of extensive configs
 */
export function validatePostalCode(postalCode: string, countryCode: string): boolean {
  const countryInfo = getCountryInfo(countryCode);
  if (!countryInfo) return true; // No validation for unknown countries

  if (!postalCode) return true; // Allow empty postal codes for flexibility

  return countryInfo.postalCodePattern ? countryInfo.postalCodePattern.test(postalCode) : true;
}

/**
 * Format postal code according to country conventions
 */
export function formatPostalCode(postalCode: string, countryCode: string): string {
  if (!postalCode) return postalCode;

  const cleanCode = postalCode.replace(/\s+/g, '').toUpperCase();

  switch (countryCode.toUpperCase()) {
    case 'CA':
      // Format: A1A 1A1
      if (cleanCode.length === 6) {
        return `${cleanCode.slice(0, 3)} ${cleanCode.slice(3)}`;
      }
      break;
    case 'GB':
      // Format: A1 1AA or A11 1AA or AA1 1AA or AA11 1AA
      if (cleanCode.length >= 5) {
        const outward = cleanCode.slice(0, -3);
        const inward = cleanCode.slice(-3);
        return `${outward} ${inward}`;
      }
      break;
  }

  return postalCode; // Return original if no formatting applied
}

/**
 * Validate address using API-driven approach
 * Replaces hardcoded country validation with dynamic field analysis
 */
export function validateAddress(address: Partial<FanAddress>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Always validate core required fields
  if (!address.addressLine1?.trim()) {
    errors.addressLine1 = 'Street address is required';
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!address.country?.trim()) {
    errors.country = 'Country is required';
  }

  // Validate postal code if provided
  if (address.postalCode && address.countryCode) {
    if (!validatePostalCode(address.postalCode, address.countryCode)) {
      const label = getPostalCodeLabel(address.countryCode);
      errors.postalCode = `Invalid ${label.toLowerCase()} format`;
    }
  }

  // If we have a complete address from API, validate based on what was provided
  if (address.source && (address.source === 'radar' || address.source === 'google')) {
    // For API-sourced addresses, trust the API's judgment on what fields are required
    // Only validate format, not presence

    // State validation - if API provided state, it's probably required for this address
    if (address.state === '' && address.countryCode) {
      // Only flag as error for countries where states are typically required
      const stateRequiredCountries = ['US', 'CA', 'AU', 'IN'];
      if (stateRequiredCountries.includes(address.countryCode)) {
        errors.state = `${getStateLabel(address.countryCode)} is required for this address`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format address according to API-provided structure
 * Uses the API's formattedAddress when available, otherwise builds dynamically
 */
export function formatAddress(address: FanAddress): string {
  // If API provided a formatted address, use it
  if (address.formattedAddress) {
    return address.formattedAddress;
  }

  // Otherwise, build address dynamically based on available fields
  const components: string[] = [];

  if (address.addressLine1) components.push(address.addressLine1);
  if (address.addressLine2) components.push(address.addressLine2);

  // Build location part
  const locationParts: string[] = [];
  if (address.city) locationParts.push(address.city);
  if (address.state) locationParts.push(address.state);
  if (address.postalCode) locationParts.push(address.postalCode);

  if (locationParts.length > 0) {
    components.push(locationParts.join(', '));
  }

  if (address.country) components.push(address.country);

  return components.join(', ');
}

/**
 * Get address field labels for a specific country
 * Uses localized labels with country-specific context
 */
export function getAddressLabels(countryCode: string, address?: FanAddress) {
  // Base labels - these should ideally come from i18n but for now we'll use English defaults
  const labels = {
    addressLine1: 'Street Address',
    addressLine2: 'Apartment, Suite, etc.',
    city: 'City',
    state: getStateLabel(countryCode),
    postalCode: getPostalCodeLabel(countryCode),
    district: 'District',
    subdistrict: 'Subdistrict',
    country: 'Country',
  };

  // If we have an address, we can provide more context-aware labels
  if (address) {
    const fieldConfig = analyzeAddressStructure(address);
    Object.keys(labels).forEach((field) => {
      if (fieldConfig[field]) {
        labels[field as keyof typeof labels] = fieldConfig[field].label;
      }
    });
  }

  return labels;
}

/**
 * Get appropriate postal code label for country
 */
function getPostalCodeLabel(countryCode: string): string {
  switch (countryCode) {
    case 'US':
      return 'ZIP Code';
    case 'GB':
    case 'AU':
      return 'Postcode';
    case 'CA':
      return 'Postal Code';
    default:
      return 'Postal Code';
  }
}

/**
 * Get appropriate district label for country
 */
function getDistrictLabel(countryCode: string): string {
  switch (countryCode) {
    case 'GB':
      return 'Country'; // England, Scotland, Wales, Northern Ireland
    case 'IN':
      return 'District';
    case 'TH':
      return 'Province';
    case 'ID':
      return 'Regency';
    case 'JP':
      return 'Region';
    default:
      return 'District';
  }
}
