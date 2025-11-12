import type { Attrs } from '@tiptap/pm/model';
import { BorderStyleType } from '../shared/BorderStyle.schema';
import * as z from 'zod';

export const SectionAttrs = z.object({
  borderColor: z.string().catch('#000000'),
  borderRadiusBottomLeft: z.number().catch(0),
  borderRadiusBottomRight: z.number().catch(0),
  borderRadiusTopLeft: z.number().catch(0),
  borderRadiusTopRight: z.number().catch(0),
  borderStyle: BorderStyleType.catch('solid'),
  borderWidth: z.number().catch(0),
  hideInEmail: z.boolean().catch(false),
  hideOnWeb: z.boolean().catch(false),
  innerSpacingBottom: z.number().catch(0),
  innerSpacingLeft: z.number().catch(0),
  innerSpacingRight: z.number().catch(0),
  innerSpacingTop: z.number().catch(0),
  outerSpacingBottom: z.number().catch(8),
  outerSpacingLeft: z.number().catch(8),
  outerSpacingRight: z.number().catch(8),
  outerSpacingTop: z.number().catch(8),
});
export type SectionAttrs = z.infer<typeof SectionAttrs>;

export const getSectionAttrs = (attrs?: Attrs) => SectionAttrs.parse(attrs ?? {});
