<template>
  <PhoneInput
    class="flex"
    countryLocale="en-EN"
    :ignored-countries="['AC']"
    noUseBrowserLocale
    fetchCountry
    @update="onUpdate"
  >
    <template #selector="{ inputValue, updateInputValue, countries }">
      <Popover v-model:open="isOpen">
        <PopoverTrigger>
          <Button
            type="button"
            variant="input"
            class="rounded-r-none border-r-0 bg-background py-4 dark:border dark:border-white/20 dark:bg-transparent dark:hover:bg-white/10"
            :class="[error && 'border-destructive']"
            :disabled="disabled"
            @click.prevent
          >
            <FlagComponent :country="inputValue" />
            <ChevronsUpDown class="-mr-2 h-4 w-4 stroke-black opacity-50 dark:stroke-white" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          class="de max-w-[300px] rounded-sm bg-background p-0 shadow-sm transition-colors"
        >
          <Command class="max-w-[300px] rounded-sm border-none bg-background">
            <CommandInput
              placeholder="Search country..."
              class="mt-1 ring-0 focus:border-input/100 focus:outline-none focus:ring-0 focus:ring-transparent dark:text-white"
            />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  v-for="option in countries"
                  :key="option.iso2"
                  :value="option.name"
                  class="group gap-2"
                  @select="
                    () => {
                      updateInputValue(option.iso2);
                      isOpen = false;
                      focused = true;
                    }
                  "
                >
                  <FlagComponent :country="option?.iso2" />
                  <span
                    class="flex-1 text-sm text-black group-hover:text-black dark:text-white dark:group-hover:text-white"
                    >{{ option.name }}</span
                  >
                  <span
                    class="text-sm text-black group-hover:text-black dark:group-hover:text-white"
                    >{{ option.dialCode }}</span
                  >
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </template>

    <template #input="{ updateInputValue, placeholder }">
      <Input
        ref="phoneInput"
        type="text"
        :variant="variant"
        class="rounded-l-none"
        :model-value="formattedValue"
        :placeholder="placeholder"
        :error="error"
        :disabled="disabled"
        inputmode="numeric"
        autocomplete="tel"
        @input="updateInputValue"
      />
    </template>
  </PhoneInput>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFocus } from '@vueuse/core';
import { ChevronsUpDown } from 'lucide-vue-next';
import PhoneInput from 'base-vue-phone-input';
import FlagComponent from './FlagComponent.vue';
import Button from '@ui/button/Button.vue';
import Popover from '@ui/popover/Popover.vue';
import PopoverTrigger from '@ui/popover/PopoverTrigger.vue';
import PopoverContent from '@ui/popover/PopoverContent.vue';
import Command from '@ui/command/Command.vue';
import CommandInput from '@ui/command/CommandInput.vue';
import CommandEmpty from '@ui/command/CommandEmpty.vue';
import CommandList from '@ui/command/CommandList.vue';
import CommandGroup from '@ui/command/CommandGroup.vue';
import CommandItem from '@ui/command/CommandItem.vue';
import Input from '@ui/input/Input.vue';
import { type LabelVariants } from '@ui/label/index';

const isOpen = ref(false);
const phoneInput = ref(null);
const { focused } = useFocus(phoneInput);
const formattedValue = ref('');

withDefaults(
  defineProps<{
    error?: string;
    disabled?: boolean;
    variant?: LabelVariants['variant'];
  }>(),
  {
    error: undefined,
    disabled: false,
  },
);

const onUpdate = (value: { isValid: boolean; formatInternational: string }) => {
  formattedValue.value = value.formatInternational;
};
</script>
