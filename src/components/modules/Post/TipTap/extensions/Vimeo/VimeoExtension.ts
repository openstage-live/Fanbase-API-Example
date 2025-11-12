import type { Attrs } from '@tiptap/pm/model';
import * as z from 'zod';

export const VimeoAttrs = z.object({
  src: z.string().catch(''),
  videoId: z.string().nullable().catch(null),
  title: z.string().catch('Vimeo video player'),
  aspectRatio: z.number().catch(16 / 9),
  autoplay: z.boolean().catch(false),
  controls: z.boolean().catch(true),
  loop: z.boolean().catch(false),
  mute: z.boolean().catch(false),
});
export type VimeoAttrs = z.infer<typeof VimeoAttrs>;

export const getVimeoAttrs = (attrs?: Attrs) => VimeoAttrs.parse(attrs ?? {});
export const defaultVimeoAttrs = getVimeoAttrs();

/**
 * Get the Vimeo embed URL with the given attributes
 * @param attributes - The attributes to use to generate the embed URL
 * @returns The Vimeo embed URL
 */
export const getVimeoEmbedUrl = (attributes: VimeoAttrs): string | null => {
  const { videoId, autoplay, controls, loop, mute } = attributes;

  if (!videoId) return null;

  const baseUrl = `https://player.vimeo.com/video/${videoId}`;
  const params = new URLSearchParams();

  if (autoplay) {
    params.set('autoplay', '1');
    params.set('muted', '1');
  }

  if (mute) {
    params.set('muted', '1');
  }

  if (!controls) {
    params.set('controls', '0');
  }

  if (loop) {
    params.set('loop', '1');
  }

  const queryString = params.toString();
  return baseUrl + (queryString ? `?${queryString}` : '');
};
