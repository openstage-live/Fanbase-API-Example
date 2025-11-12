import { ref } from 'vue';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
}

type GeolocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'not_supported';

export function useGeolocation() {
  const geolocationError = ref<GeolocationError | null>(null);

  const getErrorType = (code: number): GeolocationError['type'] => {
    switch (code) {
      case 1:
        return 'PERMISSION_DENIED';
      case 2:
        return 'POSITION_UNAVAILABLE';
      case 3:
        return 'TIMEOUT';
      default:
        return 'POSITION_UNAVAILABLE';
    }
  };

  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Location access denied by user';
      case 2:
        return 'Location information is unavailable';
      case 3:
        return 'Location request timed out';
      default:
        return 'An unknown error occurred while retrieving location';
    }
  };

  const getCurrentCoordinates = (options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error: GeolocationError = {
          code: -1,
          message: 'Geolocation is not supported by this browser',
          type: 'NOT_SUPPORTED',
        };
        geolocationError.value = error;
        reject(new Error(error.message));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // Increased timeout to 10 seconds
        maximumAge: 300000, // Allow cached position up to 5 minutes
      };

      const finalOptions = { ...defaultOptions, ...options };

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          // Clear any previous errors on success
          geolocationError.value = null;
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err: GeolocationPositionError) => {
          const error: GeolocationError = {
            code: err.code,
            message: getErrorMessage(err.code),
            type: getErrorType(err.code),
          };
          geolocationError.value = error;
          reject(new Error(error.message));
        },
        finalOptions,
      );
    });
  };

  const clearError = () => {
    geolocationError.value = null;
  };

  const getPermissionStatus = async (): Promise<GeolocationPermissionStatus> => {
    if (!navigator.geolocation) {
      return 'not_supported';
    }

    // Check if the Permissions API is available
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });

        // Safari often returns 'prompt' even when permission is already granted/denied
        // So we do an additional check for Safari
        if (permission.state === 'prompt') {
          // Try to get position with a very short timeout to check actual permission
          try {
            await getCurrentCoordinates({ timeout: 500, maximumAge: 0 });
            return 'granted';
          } catch (error) {
            console.log(error);
            if (geolocationError.value?.type === 'PERMISSION_DENIED') {
              return 'denied';
            }
            // If it's not permission denied, it might still be prompt
            return 'prompt';
          }
        }

        return permission.state as GeolocationPermissionStatus;
      } catch (error) {
        // If permissions API fails, fall back to trying to get position
        console.log(error);
      }
    }

    // Fallback: Try to get current position to determine permission status
    try {
      await getCurrentCoordinates({ timeout: 1000, maximumAge: 0 });
      return 'granted';
    } catch (error) {
      console.log(error);
      if (geolocationError.value?.type === 'PERMISSION_DENIED') {
        return 'denied';
      }
      return 'prompt';
    }
  };

  const retryWithFallback = async (
    retryOptions?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    },
    fallbackOptions?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    },
  ): Promise<GeolocationCoordinates> => {
    try {
      // First try with retry options (usually more permissive)
      return await getCurrentCoordinates(retryOptions);
    } catch (error) {
      // If retry fails, try with fallback options (usually less accurate but faster)
      if (fallbackOptions) {
        return await getCurrentCoordinates(fallbackOptions);
      }
      throw error;
    }
  };

  return {
    getCurrentCoordinates,
    geolocationError,
    clearError,
    retryWithFallback,
    getPermissionStatus,
  };
}
