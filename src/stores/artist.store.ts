import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { env } from '@/env';

export type ArtistSocialUrls = {
  appleUrl?: string;
  deezerUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  mixcloudUrl?: string;
  spotifyUrl?: string;
  tiktokUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  youtubeUrl?: string;
};

export const useArtistStore = defineStore('artist', () => {
  const id = ref(env.VITE_ARTIST_ID);
  const shortName = ref(env.VITE_ARTIST_SHORT_NAME || '');
  const name = ref(env.VITE_ARTIST_NAME || '');
  const minAge = ref(env.VITE_ARTIST_MIN_AGE || 13);
  const returnUrl = ref(env.VITE_HOME_URL);
  const stripeConnectId = ref(env.VITE_STRIPE_CONNECT_ID || '');

  const socialUrls = computed<ArtistSocialUrls>(() => ({
    appleUrl: env.VITE_ARTIST_APPLE_URL,
    deezerUrl: env.VITE_ARTIST_DEEZER_URL,
    facebookUrl: env.VITE_ARTIST_FACEBOOK_URL,
    instagramUrl: env.VITE_ARTIST_INSTAGRAM_URL,
    mixcloudUrl: env.VITE_ARTIST_MIXCLOUD_URL,
    spotifyUrl: env.VITE_ARTIST_SPOTIFY_URL,
    tiktokUrl: env.VITE_ARTIST_TIKTOK_URL,
    twitchUrl: env.VITE_ARTIST_TWITCH_URL,
    twitterUrl: env.VITE_ARTIST_TWITTER_URL,
    websiteUrl: env.VITE_ARTIST_WEBSITE_URL,
    youtubeUrl: env.VITE_ARTIST_YOUTUBE_URL,
  }));

  return {
    id,
    shortName,
    name,
    returnUrl,
    minAge,
    stripeConnectId,
    socialUrls,
  };
});
