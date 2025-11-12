<template>
  <div
    class="relative flex animate-pulse flex-col justify-between rounded-xl border border-black/30 bg-black/10 p-6 text-white shadow-2xl"
  >
    <div class="mb-4 flex items-center justify-between">
      <div class="h-6 w-24 rounded bg-black/30"></div>
      <div class="bg-green-400 h-5 w-12 rounded-full"></div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="mb-2 h-8 w-40 rounded bg-black/20"></div>
      <div class="mt-2 flex items-center justify-between text-sm text-white">
        <div class="h-4 w-20 rounded bg-black/20"></div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
