import './assets/styles/styles.pcss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@unhead/vue/client';

import VueLazyLoad from 'vue3-lazyload';
import Vue3SocialSharingPlugin from 'vue3-social-sharing';
import App from './App.vue';
import router from './router/router';
import i18n from './locales/i18n';
import Vue3Marquee from 'vue3-marquee';
import VueEasyLightbox from 'vue-easy-lightbox';

import * as Sentry from '@sentry/vue';
import { featureFlags } from '@/utils/feature.flags';
import { createGtm } from '@gtm-support/vue-gtm';
import { env } from '@/env';

// Import Mux player styles
import 'player.style/microvideo';

// Register service worker manually (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker
    .register('/sw.js', {
      scope: '/',
      type: 'classic',
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

const app = createApp(App);
const head = createHead();
if (featureFlags.sentry && env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_ENV,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    // ignoreErrors: [
    //   '[mux-player 1.5.0]',
    //   'ip2c',
    //   '__gCrWeb.instantSearch',
    //   'Authorization will not be covered by the wildcard symbol (*)',
    // ],
  });
}

if (featureFlags.gtm && env.VITE_GTM_ID) {
  try {
    app.use(
      createGtm({
        id: env.VITE_GTM_ID,
        enabled: env.VITE_ENV === 'production', // Only send events in production
        vueRouter: router,
        defer: true,
        loadScript: true,
        trackOnNextTick: true, // Enable automatic tracking but delay it to allow title updates
        debug: env.VITE_ENV !== 'production', // Enable debug logging in development and staging (but no events sent)
      }),
    );
  } catch (error) {
    console.error('Failed to initialize GTM:', error);
  }
}

app.use(head);
app.use(VueLazyLoad, {
  // options...
});
app.use(Vue3SocialSharingPlugin);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Vue3Marquee);
app.use(VueEasyLightbox);

app.mount('#app');
