import { cva, type VariantProps } from 'class-variance-authority';

export { default as Label } from './Label.vue';

export const labelVariants = cva(
  'text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-black dark:text-white',
        ghost: 'text-white',
      },
    },
  },
);

export type LabelVariants = VariantProps<typeof labelVariants>;
