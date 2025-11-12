<template>
  <div class="flex flex-col space-y-4">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="flex"
      :class="{ 'opacity-20': !step.active }"
    >
      <div
        class="text-md mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white font-Matter-Medium"
      >
        {{ index + 1 }}
      </div>
      <div class="ml-3">
        <div class="relative w-fit">
          <h3 class="text-md font-Matter text-3xl font-bold uppercase text-black">
            {{ step.title }}
          </h3>
        </div>
        <p class="text-base text-black">
          {{ step.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Step {
  title: string;
  description: string;
  active: boolean;
}

export interface StepIndicatorProps {
  steps: Step[];
}

defineProps<StepIndicatorProps>();
</script>
