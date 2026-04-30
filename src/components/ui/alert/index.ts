import { cva, type VariantProps } from 'class-variance-authority';

export { default as Alert } from './Alert.vue';
export { default as AlertDescription } from './AlertDescription.vue';
export { default as AlertTitle } from './AlertTitle.vue';

export const alertVariants = cva(
  'relative w-full rounded-lg px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3 [&>svg~*]:pl-6 backdrop-blur-sm',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'animate-shake bg-destructive border border-destructive/40 text-destructive-foreground [&>svg]:stroke-destructive-foreground text-white ',
        success:
          'bg-success/20 border border-success text-success [&>svg]:fill-success-foreground text-green-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
