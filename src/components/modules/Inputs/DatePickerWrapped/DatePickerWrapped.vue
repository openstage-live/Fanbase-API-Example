<template>
  <div class="input-wrapper">
    <div class="relative" :class="(!hasFloatLabel && 'flex flex-col-reverse gap-2') || 'mt-4'">
      <Label
        v-if="label"
        :for="name"
        :variant="variant"
        class="pointer-events-none bg-transparent px-2 text-sm dark:bg-black"
        :class="[
          error && '!text-destructive',
          hasFloatLabel &&
            'absolute start-1 top-2 z-10 origin-[0] -translate-y-7 scale-75 transform rounded-tl-md rounded-tr-md duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4',
        ]"
        >{{ label }}</Label
      >
      <Popover v-model:open="isOpen">
        <PopoverTrigger as-child>
          <div class="relative">
            <Button
              v-bind="$attrs"
              variant="input"
              type="button"
              :id="name"
              :name="name"
              :class="[!modelValue && 'text-muted-foreground', error && 'border-destructive']"
            >
              <CalendarIcon class="mr-2 h-4 w-4" color="grey" />
              <span class="dark:text-white">
                {{ displayDate }}
              </span>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          class="w-auto rounded-sm border-none bg-background p-0 shadow-sm transition-colors"
        >
          <DatePicker
            v-model="datePickerValue"
            @dateSelected="isOpen = false"
            :minYearsAgo="minYearsAgo"
          />
        </PopoverContent>
      </Popover>
    </div>
    <span class="input-error" v-if="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CalendarIcon } from 'lucide-vue-next';
import { CalendarDate } from '@internationalized/date';
import type { DateValue } from 'reka-ui';
import Button from '@ui/button/Button.vue';
import Popover from '@ui/popover/Popover.vue';
import PopoverContent from '@ui/popover/PopoverContent.vue';
import PopoverTrigger from '@ui/popover/PopoverTrigger.vue';
import Label from '@ui/label/Label.vue';
import DatePicker from './DatePicker.vue';
import { format, parseISO } from 'date-fns';
import { type LabelVariants } from '@ui/label/index';

interface DatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  error?: string;
  mode?: 'single' | 'multiple' | 'range';
  hasFloatLabel?: boolean;
  minYearsAgo?: number;
  variant?: LabelVariants['variant'];
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  label: undefined,
  error: undefined,
  placeholder: 'Pick a date',
  mode: 'single',
  hasFloatLabel: true,
  minYearsAgo: undefined,
});

const isOpen = ref(false);

const displayDate = computed(() => {
  return modelValue.value ? format(parseISO(modelValue.value), 'PPP') : props.placeholder;
});
const datePickerValue = computed({
  get() {
    const year = modelValue.value?.split('-')[0];
    const month = modelValue.value?.split('-')[1];
    const day = modelValue.value?.split('-')[2];
    if (!year || !month || !day) return undefined;
    return new CalendarDate(Number(year), Number(month), Number(day));
  },
  set(value: DateValue) {
    modelValue.value = value.toString() || '';
  },
});

const modelValue = defineModel<string | undefined>('modelValue', {
  required: true,
});
</script>
