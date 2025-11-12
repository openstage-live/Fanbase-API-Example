import { ref } from 'vue';
import { defineStore } from 'pinia';
import { env } from '@/env';

export const useArtistStore = defineStore('artist', () => {
  const id = ref(env.VITE_ARTIST_ID);
  const shortName = ref(env.VITE_ARTIST_SHORT_NAME || '');
  const name = ref(env.VITE_ARTIST_NAME || '');
  const minAge = ref(env.VITE_ARTIST_MIN_AGE || 13);
  const returnUrl = ref(env.VITE_HOME_URL);
  const stripeConnectId = ref(env.VITE_STRIPE_CONNECT_ID || '');

  return {
    id,
    shortName,
    name,
    returnUrl,
    minAge,
    stripeConnectId,
  };
});
