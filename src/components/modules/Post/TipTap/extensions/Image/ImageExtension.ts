import type { Attrs } from '@tiptap/pm/model';
import { RichImage } from '../shared/Image.schema';
import * as z from 'zod';

export const ImageType = z.enum(['link', 'download']);
export type ImageType = z.infer<typeof ImageType>;

export const ImageAlign = z.enum(['left', 'center', 'right']);
export type ImageAlign = z.infer<typeof ImageAlign>;

export const ImageAttrs = z.object({
  align: ImageAlign.catch('center'),
  aspectRatio: z.number().nullable().catch(null),
  href: z.string().catch(''),
  image: RichImage.catch(RichImage.parse({})),
  maxWidth: z.number().nullable().catch(null),
  showCaption: z.boolean().catch(true),
  type: ImageType.catch('link'),
});
export type ImageAttrs = z.infer<typeof ImageAttrs>;

export const getImageAttrs = (attrs?: Attrs) => ImageAttrs.parse(attrs ?? {});
export const defaultImageAttrs = getImageAttrs();
