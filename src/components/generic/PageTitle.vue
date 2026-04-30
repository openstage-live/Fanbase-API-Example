<template>
  <div class="mx-auto mt-16 flex max-w-xl flex-col gap-y-4 text-center lg:gap-y-8 xl:max-w-2xl">
    <h1 v-if="title" class="title-xl text-center">{{ title }}</h1>
    <h2 v-if="subtitle" class="subtitle text-center">{{ subtitle }}</h2>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
}

defineProps<Props>();
</script>
