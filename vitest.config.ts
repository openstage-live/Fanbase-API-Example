import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, 'e2e/**'],
        root: fileURLToPath(new URL('./', import.meta.url)),
        globals: true,
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
          '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
          '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
          '@generics': fileURLToPath(new URL('./src/components/generic', import.meta.url)),
          '@interfaces': fileURLToPath(new URL('./src/interfaces', import.meta.url)),
          '@modules': fileURLToPath(new URL('./src/components/modules', import.meta.url)),
          '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
          '@ui': fileURLToPath(new URL('./src/components/ui', import.meta.url)),
          '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        },
      },
    }),
  ),
);
