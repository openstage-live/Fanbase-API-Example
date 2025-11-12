import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import VueRouter from 'unplugin-vue-router/vite';

export default defineConfig(({ command: _, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      open: true,
    },
    plugins: [
      VueRouter(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'mux-player',
          },
        },
      }),
      vueDevTools(),
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
      }),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,
        includeAssets: [
          'favicon/favicon.ico',
          'favicon/favicon-16x16.png',
          'favicon/favicon-32x32.png',
          'favicon/apple-touch-icon.png',
          'favicon/android-chrome-192x192.png',
          'favicon/android-chrome-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Fanzone Example',
          short_name: 'fanzone-example',
          description: 'Fanzone Example',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: env.VITE_HOME_URL,
          scope: env.VITE_HOME_URL,
          icons: [
            {
              src: '/favicon/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/favicon/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          categories: ['music', 'entertainment'],
        },
        pwaAssets: {
          disabled: true,
          config: false,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff,woff2,ttf,eot,otf,mp4}'],
          importScripts: ['/service-worker/custom-sw.js'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 100 * 1024 * 1024, // 100MB for videos
          // Add offline fallback for navigation
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
          runtimeCaching: [
            {
              urlPattern: /favicon\.ico(?:\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'favicon',
                expiration: {
                  maxEntries: 1,

                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
              },
            },
            {
              urlPattern: /\.(js|css|html)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'assets',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
              },
            },
            {
              urlPattern: /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
              },
            },
            {
              urlPattern: /\.(woff|woff2|ttf|eot|otf)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
              },
            },
            {
              urlPattern: /\.(mp4|webm|ogg)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'videos',
                expiration: {
                  maxEntries: 10, // Limit video cache entries
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
              },
            },
            {
              urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cloudinary-images',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Add navigation fallback for offline routing
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          navigateFallback: 'index.html',
          suppressWarnings: true,
          type: 'classic',
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1000kb
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            // Add other large dependencies here
          },
        },
      },
      target: 'es2018',
    },
    optimizeDeps: {
      include: ['player.style/microvideo'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
        '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
        '@generics': fileURLToPath(new URL('./src/components/generic', import.meta.url)),
        '@modules': fileURLToPath(new URL('./src/components/modules', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@ui': fileURLToPath(new URL('./src/components/ui', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        'vue-easy-lightbox$': 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.esm.min.js',
      },
    },
  };
});
