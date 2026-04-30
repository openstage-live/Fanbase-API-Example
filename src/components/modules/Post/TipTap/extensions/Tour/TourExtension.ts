import type { Attrs } from '@tiptap/pm/model';
import type { JSONContent } from '@tiptap/core';
import * as z from 'zod';

export const TourAttrs = z.object({
  maxEvents: z.number().nullable().catch(null),
});
export type TourAttrs = z.infer<typeof TourAttrs>;

export const getTourAttrs = (attrs?: Attrs) => TourAttrs.parse(attrs ?? {});
export const defaultTourAttrs = getTourAttrs();

export const TourBlock = z.object({
  type: z.literal('tour').catch('tour'),
  attrs: TourAttrs.catch(defaultTourAttrs),
});
export type TourBlock = z.infer<typeof TourBlock>;

export const getTourBlock = (block?: JSONContent) => TourBlock.parse(block ?? {});
export const defaultTourBlock = getTourBlock();
