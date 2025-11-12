import type { Attrs } from '@tiptap/pm/model';
import * as z from 'zod';

export const SpotifyEmbedTypes = z.enum([
  'artist',
  'album',
  'track',
  'playlist',
  'show',
  'episode',
]);
export type SpotifyEmbedType = z.infer<typeof SpotifyEmbedTypes>;

export const SpotifyEmbedSizes = z.enum(['compact', 'normal']);
export type SpotifyEmbedSize = z.infer<typeof SpotifyEmbedSizes>;

export const SpotifyEmbedThemes = z.enum(['0', '1']);
export type SpotifyEmbedTheme = z.infer<typeof SpotifyEmbedThemes>;

export const SpotifyAttrs = z.object({
  id: z.string().catch(''),
  size: SpotifyEmbedSizes.catch('normal'),
  src: z.string().catch(''),
  theme: SpotifyEmbedThemes.catch('1'),
  type: SpotifyEmbedTypes.catch('track'),
});
export type SpotifyAttrs = z.infer<typeof SpotifyAttrs>;

export const getSpotifyAttrs = (attrs?: Attrs) => SpotifyAttrs.parse(attrs ?? {});
export const defaultSpotifyAttrs = getSpotifyAttrs();

/**
 * Get the Spotify embed URL with the given attributes
 * @param attributes - The attributes to use to generate the embed URL
 * @returns The Spotify embed URL
 */
export const getSpotifyEmbedUrl = (attributes: SpotifyAttrs): string => {
  const { type, id, theme } = attributes;

  if (!id || !type) return '';

  const baseUrl = `https://open.spotify.com/embed/${type}/${id}`;
  const params = new URLSearchParams();

  if (theme === '0') {
    params.set('theme', '0');
  }

  const queryString = params.toString();
  return baseUrl + (queryString ? `?${queryString}` : '');
};
