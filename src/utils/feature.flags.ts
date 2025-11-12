import { env } from '@/env';

export const featureFlags = {
  telemetry: env.VITE_FF_TELEMETRY?.toLowerCase() === 'true',
  sentry: env.VITE_FF_SENTRY?.toLowerCase() === 'true',
  gtm: env.VITE_FF_GTM?.toLowerCase() === 'true',
};
