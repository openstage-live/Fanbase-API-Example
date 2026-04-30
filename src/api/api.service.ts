import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAccountStore } from '@/stores/account.store';
import { z, type ZodType } from 'zod';
import * as Sentry from '@sentry/vue';
import { env } from '@/env';
import axios, { CanceledError, isAxiosError } from 'axios';

/**
 * Schema for API error objects.
 */
export const ApiError = z.object({
  error: z.object({
    message: z.string(),
  }),
});

/**
 * Schema for API OK response objects.
 */
export const ApiOk = z.object({
  status: z.literal('OK'),
});

/**
 * Type for API error objects.
 */
export type ApiError = z.infer<typeof ApiError>;

/**
 * Type for API OK response objects.
 */
export type ApiOk = z.infer<typeof ApiOk>;

/**
 * Result type for API requests.
 */
export type ApiResult<T> = { success: true; data: T } | { success: false; message: string };

/**
 * Service for making API requests.
 */
class ApiService {
  private instance: AxiosInstance;
  public openstageApiFan = env.VITE_OPENSTAGE_API_FAN;
  public openstageApiFanQueue = env.VITE_OPENSTAGE_API_FAN_QUEUE;

  constructor() {
    this.instance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Makes an HTTP request and validates the response.
   * @param config - Axios request configuration.
   * @param schema - Zod schema for response validation.
   * @param options - Optional configuration object.
   * @param options.signal - Optional AbortSignal to cancel the request.
   * @param options.requiresAuth - Optional flag to indicate if the request requires authentication.
   */
  public async request<T extends ZodType>(
    config: AxiosRequestConfig,
    schema: T,
    options?: { signal?: AbortSignal; requiresAuth?: boolean },
  ): Promise<ApiResult<z.infer<T>>> {
    const { signal, requiresAuth } = options || {};

    if (requiresAuth) {
      const authToken = useAccountStore().authToken;
      if (!authToken) {
        return { success: false, message: 'Unauthorized' };
      }
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${authToken}`,
      };
    }

    try {
      const response = await this.instance.request({
        ...config,
        signal,
      });
      const result = schema.safeParse(response.data);

      if (!result.success) {
        const errorDetails = result.error?.issues || [];
        console.log('Zod validation error:', {
          errors: errorDetails,
          errorObject: result.error,
          url: config.url,
          method: config.method,
          responseData: response.data,
        });

        Sentry.captureException(new Error('API response schema validation failed'), {
          tags: {
            api_error_type: 'schema_validation_failed',
            url: config.url || 'unknown',
            method: config.method || 'unknown',
          },
          extra: {
            error: z.prettifyError(result.error),
            requestConfig: {
              url: config.url,
              method: config.method,
              params: config.params,
              data: config.data,
            },
            response: response.data,
          },
          level: 'error',
        });

        return { success: false, message: 'Unknown response' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      if (isAxiosError(error)) {
        if (error instanceof CanceledError) {
          return { success: false, message: 'Request cancelled' };
        }

        const errorResult = ApiError.safeParse(error.response?.data);

        if (errorResult.success) {
          return { success: false, message: errorResult.data.error.message };
        }

        return {
          success: false,
          message: `HTTP ${error.response?.status ?? 'unknown'}: ${error.response?.statusText || error.message}`,
        };
      }

      return {
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

/**
 * Shared instance of ApiService.
 */
const apiService = new ApiService();

export { apiService };
