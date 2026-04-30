import type { Attrs } from '@tiptap/pm/model';
import { TextAlign } from '../TextAlign/TextAlignExtension';
import * as z from 'zod';

export const ButtonPreset = z.enum(['primary', 'secondary']);
export type ButtonPreset = z.infer<typeof ButtonPreset>;

export const ButtonType = z.enum(['link', 'download']);
export type ButtonType = z.infer<typeof ButtonType>;

export const ButtonAttrs = z.object({
  href: z.string().catch(''),
  preset: ButtonPreset.catch('primary'),
  type: ButtonType.catch('link'),
  textAlign: TextAlign.catch('center'),
});
export type ButtonAttrs = z.infer<typeof ButtonAttrs>;

export const getButtonAttrs = (attrs?: Attrs) => ButtonAttrs.parse(attrs ?? {});
export const defaultButtonAttrs = getButtonAttrs();
