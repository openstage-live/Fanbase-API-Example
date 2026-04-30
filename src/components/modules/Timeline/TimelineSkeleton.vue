<template>
  <div class="mt-8">
    <div class="relative">
      <div class="flex gap-x-5">
        <div
          class="h-5 max-h-5 min-h-5 w-5 min-w-5 max-w-5 animate-pulse rounded-full bg-white/20"
        ></div>
        <div class="h-6 w-32 animate-pulse rounded bg-white/20"></div>
      </div>
      <div class="mt-8 space-y-6">
        <div v-for="i in 3" :key="i" class="flex gap-x-5">
          <div
            class="h-5 max-h-5 min-h-5 w-5 min-w-5 max-w-5 animate-pulse rounded-full bg-white/20"
          ></div>
          <div class="flex-1 space-y-3">
            <div class="h-6 w-3/4 animate-pulse rounded bg-white/20"></div>
            <div class="h-4 w-1/2 animate-pulse rounded bg-white/20"></div>
            <div class="h-4 w-1/3 animate-pulse rounded bg-white/20"></div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="absolute bottom-0 left-6 z-10 block h-20 w-[1px] bg-gradient-to-t from-black/100 to-black/0 lg:left-10"
    ></div>
  </div>
</template>
