<template>
  <RouterLink :to="{ name: !isAuthenticated ? 'SignUp' : 'Account' }" @click="headerStore.closeNav">
    <AccountIcon :isHeaderInverse="isHeaderInverse" class="h-16 w-8" />
  </RouterLink>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import { useHeaderStore } from '@stores/header.store';

import AccountIcon from '@generics/AccountIcon.vue';

defineProps<{
  isHeaderInverse: boolean;
}>();

const accountStore = useAccountStore();
const { isAuthenticated } = storeToRefs(accountStore);
const headerStore = useHeaderStore();
</script>
