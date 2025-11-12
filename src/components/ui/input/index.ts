import { cva, type VariantProps } from 'class-variance-authority';

export { default as Input } from './Input.vue';

export const inputVariants = cva(
  'flex h-10 w-full  px-3 py-1 text-sm shadow-sm ring-0 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0 focus:ring-transparent',
  {
    variants: {
      variant: {
        default:
          'bg-white focus:border-input/60 border border-black/20 rounded-md dark:border-white/20 dark:bg-transparent dark:text-white',
        ghost: 'bgez -transparent border border-white/30 text-white focus:border-white/100 ',
      },
      defaultVariants: {
        variant: 'default',
      },
    },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;
