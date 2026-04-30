import * as z from 'zod';

export const RichImage = z.object({
  src: z.string().catch(''),
  alt: z.string().catch(''),
  title: z.string().catch(''),
  caption: z.string().catch(''),
});
export type RichImage = z.infer<typeof RichImage>;
