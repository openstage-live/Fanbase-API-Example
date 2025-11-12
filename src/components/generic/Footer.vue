<template>
  <div class="relative z-10 border-t border-white/10">
    <div class="bg-black py-8 transition-all duration-300">
      <div class="container">
        <div class="grid gap-y-8">
          <NavLinks />
          <div class="grid gap-y-4">
            <div class="flex w-full justify-center text-white">
              <a
                class="link-md text-off-black hover:text-white/70"
                href="https://openstage.live/"
                target="_blank"
              >
                {{ t('common.copyright') }} {{ currentYear }}.
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';
import { computed } from 'vue';

import NavLinks from '@modules/NavLinks.vue';

const { t } = useTranslation();

const currentYear = computed(() => {
  return new Date().getFullYear();
});
</script>
