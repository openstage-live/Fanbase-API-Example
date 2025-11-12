import type { Attrs } from '@tiptap/pm/model';
import * as z from 'zod';

export const AudioAttrs = z.object({
  contentId: z.string().catch(''),
  title: z.string().catch(''),
});
export type AudioAttrs = z.infer<typeof AudioAttrs>;

export const getAudioAttrs = (attrs?: Attrs) => AudioAttrs.parse(attrs ?? {});
export const defaultAudioAttrs = getAudioAttrs();
