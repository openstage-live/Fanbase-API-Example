import { z } from 'zod';

// Centralized schema for all environment variables consumed by the app.
// Use this module instead of accessing import.meta.env directly.
const EnvSchema = z.object({
  // Openstage API Configuration
  VITE_OPENSTAGE_API_FAN: z.string(),
  VITE_OPENSTAGE_API_FAN_QUEUE: z.string().optional(),

  // Artist Configuration
  VITE_ARTIST_ID: z.string().min(1),
  VITE_ARTIST_SHORT_NAME: z.string().optional(),
  VITE_ARTIST_NAME: z.string().optional(),
  VITE_ARTIST_MIN_AGE: z
    .string()
    .transform((val) => {
      const parsed = Number.parseInt(val, 10);
      if (Number.isNaN(parsed)) throw new Error('VITE_ARTIST_MIN_AGE must be an integer');
      return parsed;
    })
    .optional(),

  // Artist social URLs
  VITE_ARTIST_APPLE_URL: z.string().optional(),
  VITE_ARTIST_DEEZER_URL: z.string().optional(),
  VITE_ARTIST_FACEBOOK_URL: z.string().optional(),
  VITE_ARTIST_INSTAGRAM_URL: z.string().optional(),
  VITE_ARTIST_MIXCLOUD_URL: z.string().optional(),
  VITE_ARTIST_SPOTIFY_URL: z.string().optional(),
  VITE_ARTIST_TIKTOK_URL: z.string().optional(),
  VITE_ARTIST_TWITCH_URL: z.string().optional(),
  VITE_ARTIST_TWITTER_URL: z.string().optional(),
  VITE_ARTIST_WEBSITE_URL: z.string().optional(),
  VITE_ARTIST_YOUTUBE_URL: z.string().optional(),

  // Site Metadata
  VITE_SITE_TITLE: z.string().optional(),
  VITE_SITE_DESCRIPTION: z.string().optional(),

  // Application URLs
  VITE_HOME_URL: z.string(),

  // Stripe Configuration
  VITE_STRIPE_PK: z.string().default(''),
  VITE_STRIPE_CONNECT_ID: z.string().optional(),

  // Geolocation Configuration
  VITE_RADAR_KEY: z.string().optional(),
  VITE_GOOGLE_MAPS_API_KEY: z.string().default(''),

  // Mux Configuration
  VITE_MUX_ENV_KEY: z.string().optional(),

  // Environment
  VITE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Feature Flags & Integrations
  VITE_FF_TELEMETRY: z.enum(['true', 'false']).optional(),
  VITE_FF_SENTRY: z.enum(['true', 'false']).optional(),
  VITE_FF_GTM: z.enum(['true', 'false']).optional(),
  VITE_FF_PASSWORD: z.string().optional(),

  // Sentry Configuration
  VITE_SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Google Tag Manager
  VITE_GTM_ID: z.string().optional(),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issues) => `${issues.path.join('.')}: ${issues.message}`)
    .join('\n - ');
  throw new Error(`Invalid environment configuration:\n - ${issues}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof EnvSchema>;
