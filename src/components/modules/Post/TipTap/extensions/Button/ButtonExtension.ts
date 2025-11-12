import type { Attrs } from '@tiptap/pm/model';
import { TextAlign } from '../TextAlign/TextAlignExtension';
import * as z from 'zod';

export const ButtonSize = z.enum(['sm', 'md', 'lg']);
export type ButtonSize = z.infer<typeof ButtonSize>;

export const ButtonColor = z.enum(['primary', 'secondary']);
export type ButtonColor = z.infer<typeof ButtonColor>;

export const ButtonVariant = z.enum(['solid', 'outline']);
export type ButtonVariant = z.infer<typeof ButtonVariant>;

export const ButtonType = z.enum(['link', 'download']);
export type ButtonType = z.infer<typeof ButtonType>;

export const ButtonAttrs = z.object({
  href: z.string().catch(''),
  size: ButtonSize.catch('md'),
  color: ButtonColor.catch('primary'),
  variant: ButtonVariant.catch('solid'),
  type: ButtonType.catch('link'),
  textAlign: TextAlign.catch('left'),
});
export type ButtonAttrs = z.infer<typeof ButtonAttrs>;

export const getButtonAttrs = (attrs?: Attrs) => ButtonAttrs.parse(attrs ?? {});
export const defaultButtonAttrs = getButtonAttrs();
