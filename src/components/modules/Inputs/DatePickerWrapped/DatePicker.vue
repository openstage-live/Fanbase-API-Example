<template>
  <CalendarRoot
    v-slot="{ date, grid, weekDays }"
    v-model:placeholder="placeholder"
    v-bind="forwarded"
    :maxValue="maxDate"
    :class="cn('rounded-md border p-3', props.class)"
  >
    <CalendarHeader>
      <CalendarHeading class="flex w-full items-center justify-between gap-2">
        <Select
          :default-value="placeholder.month.toString()"
          @update:model-value="
            (v: unknown) => {
              if (!v || !placeholder || typeof v === 'object') return;
              const numValue = Number(v);
              if (isNaN(numValue) || numValue === placeholder?.month) return;
              placeholder = placeholder.set({
                month: numValue,
              });
            }
          "
        >
          <SelectTrigger
            :aria-label="t('input.label.selectMonth')"
            class="w-[60%] border-input/20 dark:border-white/20"
          >
            <SelectValue
              class="!text-black dark:!text-white"
              :placeholder="t('input.label.selectMonth')"
            />
          </SelectTrigger>
          <SelectContent class="max-h-[200px] border-input/20 stroke-white dark:border-white/20">
            <SelectItem
              v-for="month in createYear({ dateObj: date })"
              :key="month.toString()"
              :value="month.month.toString()"
            >
              <span class="!text-black dark:!text-white">{{
                formatter.custom(toDate(month), { month: 'long' })
              }}</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          :default-value="placeholder.year.toString()"
          @update:model-value="
            (v: unknown) => {
              if (!v || !placeholder || typeof v === 'object') return;
              const numValue = Number(v);
              if (isNaN(numValue) || numValue === placeholder?.year) return;
              placeholder = placeholder.set({
                year: numValue,
              });
            }
          "
        >
          <SelectTrigger
            :aria-label="t('input.label.selectYear')"
            class="w-[40%] border-input/20 dark:border-white/20"
          >
            <SelectValue
              class="!text-black dark:!text-white"
              :placeholder="t('input.label.selectYear')"
            />
          </SelectTrigger>
          <SelectContent class="max-h-[200px] border-input/20 dark:border-white/20">
            <SelectItem
              v-for="yearValue in createDecade({
                dateObj: date,
                startIndex: -50,
                endIndex: maxDate ? Math.min(50, maxDate.year - date.year) : 50,
              })"
              :key="yearValue.toString()"
              :value="yearValue.year.toString()"
            >
              <span class="!text-black dark:!text-white">{{ yearValue.year }}</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </CalendarHeading>
    </CalendarHeader>

    <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()">
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell v-for="day in weekDays" :key="day">
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody class="grid">
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`weekDate-${index}`"
            class="mt-2 w-full"
          >
            <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                @click="$emit('dateSelected')"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>

<script setup lang="ts">
import { cn } from '@/utils/common';
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
} from '@ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { type DateValue, getLocalTimeZone, today } from '@internationalized/date';
import { useVModel } from '@vueuse/core';
import {
  CalendarRoot,
  type CalendarRootEmits,
  type CalendarRootProps,
  useDateFormatter,
  useForwardPropsEmits,
} from 'reka-ui';
import { createDecade, createYear, toDate } from 'reka-ui/date';
import { computed, type HTMLAttributes, type Ref } from 'vue';
import { useTranslation } from '@/locales/i18n';

const calculateMaxDate = (yearsAgo?: number): DateValue => {
  if (!yearsAgo) return today(getLocalTimeZone());
  const currentDate = today(getLocalTimeZone());
  return currentDate.set({ year: currentDate.year - yearsAgo });
};

const props = withDefaults(
  defineProps<
    CalendarRootProps & {
      class?: HTMLAttributes['class'];
      minYearsAgo?: number;
    }
  >(),
  {
    modelValue: undefined,
    weekdayFormat: 'short',
    minYearsAgo: undefined,
  },
);

const emits = defineEmits<CalendarRootEmits & { dateSelected: [] }>();

const { t } = useTranslation();

const delegatedProps = computed(() => {
  const { class: _, placeholder: __, ...delegated } = props;

  return delegated;
});

const maxDate = computed(() => calculateMaxDate(props.minYearsAgo));

const placeholder = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: maxDate.value,
}) as Ref<DateValue>;

const forwarded = useForwardPropsEmits(delegatedProps, emits);

const formatter = useDateFormatter('en');
</script>

<style scoped>
* {
  color: hsla(var(--primary));
}
</style>
