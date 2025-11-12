<template>
  <header
    class="fixed left-0 top-0 z-50 w-full border-b border-white/10 transition-transform duration-300"
    :class="[`${background}`, { '-translate-y-full': isHeaderHidden }]"
  >
    <div class="container relative z-30 flex w-full items-center justify-between">
      <div class="flex items-center">
        <HeaderLeft :isHeaderInverse="isHeaderInverse" />
      </div>
      <HeaderMiddle :isHeaderInverse="isHeaderInverse" />
      <div class="flex">
        <MenuButton
          :tabindex="0"
          :isOpen="isNavOpen"
          :color="isHeaderInverse ? 'white' : 'black'"
          @click="headerStore.toggleNav"
          @keydown.enter="headerStore.toggleNav"
        />
      </div>
    </div>
    <div
      class="fixed left-0 top-0 h-dvh w-screen transition-all"
      :class="
        isNavOpen
          ? 'pointer-events-auto bg-black opacity-100 backdrop-blur-lg'
          : 'pointer-events-none -translate-y-full opacity-0'
      "
    >
      <div
        class="container flex h-full w-full flex-col justify-between overflow-y-scroll px-4 pb-8 pt-32"
      >
        <div class="flex h-full flex-col justify-between">
          <NavLinks canAnimate :isAnimated="isNavOpen" class="mt-4" />
        </div>
      </div>
      <div class="absolute left-0 top-0 -z-10 h-dvh w-screen" @click="headerStore.toggleNav" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHeaderStore } from '@stores/header.store';
import { useIndexStore } from '@stores/index.store';
import { storeToRefs } from 'pinia';

import MenuButton from '@generics/Buttons/MenuButton.vue';
import NavLinks from '@modules/NavLinks.vue';
import HeaderLeft from '@modules/Header/HeaderLeft.vue';
import HeaderMiddle from '@modules/Header/HeaderMiddle.vue';

const props = defineProps({
  background: {
    type: String,
    default: 'bg-black',
  },
});

const route = useRoute();
const headerStore = useHeaderStore();
const indexStore = useIndexStore();

const { isNavOpen } = storeToRefs(headerStore);
const { lastScrollPosition } = storeToRefs(indexStore);

const isHeaderHidden = ref(false);

const isHeaderInverse = computed(() => props.background === 'bg-black' || isNavOpen.value);

const handleScroll = () => {
  const scrollTop = window.scrollY;
  const scrollDirection = scrollTop > lastScrollPosition.value ? 'down' : 'up';

  if (scrollDirection === 'down' && scrollTop > 100) {
    isHeaderHidden.value = true;
  } else if (scrollDirection === 'up' || scrollTop === 0) {
    isHeaderHidden.value = false;
  }

  indexStore.updateScrollPosition(scrollTop);
};

watch(
  () => route.fullPath,
  () => {
    if (isNavOpen.value) {
      headerStore.toggleNav();
    }
  },
);

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
