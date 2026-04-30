import type { Attrs } from '@tiptap/pm/model';
import { RichImage } from '../shared/Image.schema';
import * as z from 'zod';

export const GalleryAttrs = z.object({
  images: z.array(RichImage).catch([]),
  columns: z.number().catch(3),
  gap: z.number().catch(8),
  aspectRatio: z.number().nullable().catch(null),
  captions: z.boolean().catch(true),
});
export type GalleryAttrs = z.infer<typeof GalleryAttrs>;

export const getGalleryAttrs = (attrs?: Attrs) => GalleryAttrs.parse(attrs ?? {});
export const defaultGalleryAttrs = getGalleryAttrs();
