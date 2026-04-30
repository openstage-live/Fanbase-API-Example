import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useScrollLock } from '@vueuse/core';
import { useAccountStore } from '@stores/account.store';

export const useHeaderStore = defineStore('header', () => {
  const accountStore = useAccountStore();
  const isLocked = useScrollLock(document);
  const isNavOpen = ref(false);

  const toggleNav = () => {
    isNavOpen.value = !isNavOpen.value;
    isLocked.value = !isLocked.value;
  };

  const closeNav = () => {
    isNavOpen.value = false;
    isLocked.value = false;
  };

  const signOut = () => {
    accountStore.logoutFan('Home');
    closeNav();
  };

  return {
    isNavOpen,
    toggleNav,
    closeNav,
    signOut,
  };
});
