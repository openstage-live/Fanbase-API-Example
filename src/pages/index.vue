<template>
  <LoggedIn v-if="isAuthenticated" />
  <LoggedOut v-else />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@stores/account.store';
import LoggedIn from '@modules/Home/LoggedIn.vue';
import LoggedOut from '@modules/Home/LoggedOut.vue';

definePage({
  name: 'Home',
  meta: {
    public: true,
    bgColor: 'black',
  },
});

const accountStore = useAccountStore();
const { isAuthenticated } = storeToRefs(accountStore);
</script>
