import { cva, type VariantProps } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-xl font-Matter transition-colors focus:ring-0  focus:ring-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        default:
          'btn btn--default bg-primary dark:bg-white text-primary-foreground dark:text-black shadow transition hover:scale-[1.02]',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        outlineInverse: 'bg-transparent shadow-sm hover:bg-white/10 hover:text-accent-foreground',
        secondary:
          'btn btn--secondary bg-secondary text-secondary-foreground shadow-sm transition hover:scale-105',
        oat: 'btn btn--oat bg-white text-oat-foreground shadow-sm transition hover:scale-105',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        inverse:
          'btn btn--inverse bg-black dark:bg-white text-white dark:text-black transition hover:scale-105',
        white: 'btn btn--white bg-white text-black',
        link: 'text-primary dark:text-white underline-offset-4 hover:underline',
        disabled: 'btn--disabled bg-light-grey text-white',
        input:
          'flex h-1 w-full justify-start rounded-sm border focus-visible:border-black/20 focus:border-black/20 border-black/20 rounded-md dark:border-white dark:border-white/20 bg-background px-3 py-1 text-left text-sm font-normal shadow-sm ring-0 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-background/100 disabled:cursor-not-allowed disabled:opacity-50',
        inputDecorator:
          'flex h-1 w-full justify-start border border-white dark:border-white/20 bg-background px-3 py-1 text-left text-sm font-normal shadow-sm ring-0 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-background/100 disabled:cursor-not-allowed disabled:opacity-50 before:absolute before:-left-2 before:block before:h-full before:w-2 before:bg-contain before:bg-right before:bg-no-repeat after:absolute after:-right-2 after:block after:h-full after:w-2 after:bg-contain after:bg-left after:bg-no-repeat after:top-0 before:top-0 dark:before:bg-none dark:after:bg-none',
        inputGhost:
          'flex h-1 w-full justify-start rounded-sm border border-white/40 bg-transparent px-3 py-1 text-left text-sm font-normal shadow-sm ring-0 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-background/10  disabled:cursor-not-allowed disabled:opacity-50 group input-ghost',
        rounded: 'rounded-full bg-white text-black font-Matter-Medium uppercase',
        roundedInverse: 'rounded-full bg-black text-white font-Matter-Medium uppercase',
        roundedOutline:
          'rounded-full bg-transparent border border-white text-white font-Matter-Medium uppercase',
      },
      size: {
        default: 'h-10 px-4 py-5',
        xs: 'h-7 px-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-10 px-4',
        xl: 'h-14 px-4 text-3xl',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
