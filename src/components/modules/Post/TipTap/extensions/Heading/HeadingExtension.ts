import type { Attrs } from '@tiptap/pm/model';
import { TextAlign } from '../TextAlign/TextAlignExtension';
import * as z from 'zod';

export const Level = z.literal([1, 2, 3, 4, 5, 6]);
export type Level = z.infer<typeof Level>;

export const HeadingAttrs = z.object({
  level: Level.catch(1),
  textAlign: TextAlign.catch('left'),
});
export type HeadingAttrs = z.infer<typeof HeadingAttrs>;

export const getHeadingAttrs = (attrs?: Attrs) => HeadingAttrs.parse(attrs ?? {});
export const defaultHeadingAttrs = getHeadingAttrs();
