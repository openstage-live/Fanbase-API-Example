<template>
  <RouterLink :to="{ name: 'Home' }" @click="headerStore.closeNav">
    <Logo class="w-auto" :color="isHeaderInverse ? 'white' : 'black'" />
  </RouterLink>
</template>

<script setup lang="ts">
import { useHeaderStore } from '@stores/header.store';
import Logo from '@generics/Logo.vue';

const headerStore = useHeaderStore();

defineProps<{
  isHeaderInverse: boolean;
}>();
</script>
