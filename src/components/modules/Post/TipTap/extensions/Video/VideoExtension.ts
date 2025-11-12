import type { Attrs } from '@tiptap/pm/model';
import * as z from 'zod';

export const VideoAttrs = z.object({
  contentId: z.string().catch(''),
  title: z.string().catch(''),
  aspectRatio: z.number().catch(16 / 9),
  autoplay: z.boolean().catch(false),
  controls: z.boolean().catch(true),
  loop: z.boolean().catch(false),
  mute: z.boolean().catch(false),
});
export type VideoAttrs = z.infer<typeof VideoAttrs>;

export const getVideoAttrs = (attrs?: Attrs) => VideoAttrs.parse(attrs ?? {});
export const defaultVideoAttrs = getVideoAttrs();
