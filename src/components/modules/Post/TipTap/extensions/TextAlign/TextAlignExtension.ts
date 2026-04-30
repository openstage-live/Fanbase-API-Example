import type { Attrs } from '@tiptap/pm/model';
import * as z from 'zod';

export const TextAlign = z.enum(['left', 'center', 'right', 'justify']);
export type TextAlign = z.infer<typeof TextAlign>;

export const TextAlignAttrs = z.object({
  textAlign: TextAlign.catch('left'),
});
export type TextAlignAttrs = z.infer<typeof TextAlignAttrs>;

export const getTextAlignAttrs = (attrs?: Attrs) => TextAlignAttrs.parse(attrs ?? {});
export const defaultTextAlignAttrs = getTextAlignAttrs();
