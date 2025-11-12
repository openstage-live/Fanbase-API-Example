<template>
  <div class="relative flex h-6 w-6 cursor-pointer flex-col items-center justify-center gap-1">
    <div
      class="top h-0.5 w-5 bg-black transition-all duration-200"
      :class="[{ 'translate-y-1.5 rotate-45 bg-white': isOpen }, `bg-${color}`]"
    />
    <div
      class="middle h-0.5 w-5 bg-black transition-all duration-200"
      :class="[{ 'opacity-0': isOpen }, `bg-${color}`]"
    />
    <div
      class="bottom h-0.5 w-5 bg-black transition-all duration-200"
      :class="[{ '-translate-y-1.5 -rotate-45 bg-white': isOpen }, `bg-${color}`]"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'black',
  },
});
</script>
