import type { Attrs } from '@tiptap/pm/model';
import { BorderStyleType } from '../shared/BorderStyle.schema';
import * as z from 'zod';

export const SectionAttrs = z.object({
  backgroundColor: z.string().nullable().catch(null),
  backgroundImage: z.string().nullable().catch(null),
  borderColor: z.string().nullable().catch(null),
  borderRadiusBottomLeft: z.number().catch(0),
  borderRadiusBottomRight: z.number().catch(0),
  borderRadiusTopLeft: z.number().catch(0),
  borderRadiusTopRight: z.number().catch(0),
  borderStyle: BorderStyleType.catch('solid'),
  borderWidth: z.number().catch(0),
  gap: z.number().catch(8),
  hideInEmail: z.boolean().catch(false),
  hideOnWeb: z.boolean().catch(false),
  paddingBottom: z.number().catch(8),
  paddingLeft: z.number().catch(8),
  paddingRight: z.number().catch(8),
  paddingTop: z.number().catch(8),
});
export type SectionAttrs = z.infer<typeof SectionAttrs>;

export const getSectionAttrs = (attrs?: Attrs) => SectionAttrs.parse(attrs ?? {});
