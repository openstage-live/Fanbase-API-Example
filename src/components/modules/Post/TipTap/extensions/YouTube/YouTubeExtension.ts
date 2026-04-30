import type { Attrs } from '@tiptap/pm/model';
import * as z from 'zod';

export const YouTubeAttrs = z.object({
  src: z.string().catch(''),
  videoId: z.string().nullable().catch(null),
  title: z.string().catch('YouTube video player'),
  aspectRatio: z.number().catch(16 / 9),
  autoplay: z.boolean().catch(false),
  controls: z.boolean().catch(true),
  loop: z.boolean().catch(false),
  mute: z.boolean().catch(false),
});
export type YouTubeAttrs = z.infer<typeof YouTubeAttrs>;

export const getYouTubeAttrs = (attrs?: Attrs) => YouTubeAttrs.parse(attrs ?? {});
export const defaultYouTubeAttrs = getYouTubeAttrs();

/**
 * Get the YouTube embed URL with the given attributes
 * @param attributes - The attributes to use to generate the embed URL
 * @returns The YouTube embed URL
 */
export const getYouTubeEmbedUrl = (attributes: YouTubeAttrs): string | null => {
  const { videoId, autoplay, controls, loop, mute } = attributes;

  if (!videoId) return null;

  const baseUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = new URLSearchParams();

  if (autoplay) {
    params.set('autoplay', '1');
    params.set('mute', '1');
  }

  if (mute) {
    params.set('mute', '1');
  }

  if (controls) {
    params.set('controls', '1');
  }

  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId ?? '');
  }

  const queryString = params.toString();
  return baseUrl + (queryString ? `?${queryString}` : '');
};
