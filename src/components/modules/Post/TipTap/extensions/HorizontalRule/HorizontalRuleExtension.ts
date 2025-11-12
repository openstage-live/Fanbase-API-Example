import type { Attrs } from '@tiptap/pm/model';
import { BorderStyleType } from '../shared/BorderStyle.schema';
import * as z from 'zod';

export const HorizontalRuleAttrs = z.object({
  style: BorderStyleType.catch('solid'),
  width: z.number().catch(1),
  color: z.string().catch('#000000'),
});
export type HorizontalRuleAttrs = z.infer<typeof HorizontalRuleAttrs>;

export const getHorizontalRuleAttrs = (attrs?: Attrs) => HorizontalRuleAttrs.parse(attrs ?? {});
export const defaultHorizontalRuleAttrs = getHorizontalRuleAttrs();
