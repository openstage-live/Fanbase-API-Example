import * as z from 'zod';

export const BorderStyleType = z.enum(['solid', 'dashed', 'dotted', 'double']);
export type BorderStyleType = z.infer<typeof BorderStyleType>;

export const BorderStyleOption = z.object({
  title: z.string(),
  value: BorderStyleType,
});
export type BorderStyleOption = z.infer<typeof BorderStyleOption>;

export const borderStyleOptions: BorderStyleOption[] = [
  { title: 'Solid', value: 'solid' },
  { title: 'Dashed', value: 'dashed' },
  { title: 'Dotted', value: 'dotted' },
  { title: 'Double', value: 'double' },
];
