import type { Attrs } from '@tiptap/pm/model';
import { RichImage } from '../shared/Image.schema';
import * as z from 'zod';

export const CarouselAttrs = z.object({
  images: z.array(RichImage).catch([]),
  autoplay: z.boolean().catch(false),
  loop: z.boolean().catch(true),
  navigation: z.boolean().catch(true),
  aspectRatio: z.number().catch(16 / 9),
  captions: z.boolean().catch(true),
});
export type CarouselAttrs = z.infer<typeof CarouselAttrs>;

export const getCarouselAttrs = (attrs?: Attrs) => CarouselAttrs.parse(attrs ?? {});
export const defaultCarouselAttrs = getCarouselAttrs();
