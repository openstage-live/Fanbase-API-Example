import type { Attrs } from '@tiptap/pm/model';
import * as z from 'zod';

export const MergeTagValue = z.enum(['{{fan_first_name}}', '{{fan_last_name}}', '{{fan_email}}']);
export type MergeTagValue = z.infer<typeof MergeTagValue>;

export const MergeTagAttrs = z.object({
  value: MergeTagValue.catch('{{fan_first_name}}'),
});
export type MergeTagAttrs = z.infer<typeof MergeTagAttrs>;

export const getMergeTagAttrs = (attrs?: Attrs) => MergeTagAttrs.parse(attrs ?? {});
export const defaultMergeTagAttrs = getMergeTagAttrs();
