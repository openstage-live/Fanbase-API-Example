import type { Attrs } from '@tiptap/pm/model';
import { TextAlign } from '../TextAlign/TextAlignExtension';
import * as z from 'zod';

export const ParagraphAttrs = z.object({
  textAlign: TextAlign.catch('left'),
});
export type ParagraphAttrs = z.infer<typeof ParagraphAttrs>;

export const getParagraphAttrs = (attrs?: Attrs) => ParagraphAttrs.parse(attrs ?? {});
export const defaultParagraphAttrs = getParagraphAttrs();
