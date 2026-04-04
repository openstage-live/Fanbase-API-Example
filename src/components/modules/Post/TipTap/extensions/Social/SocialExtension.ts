import type { ArtistSocialUrls } from '@/stores/artist.store';
import type { Attrs } from '@tiptap/pm/model';
import { getIconUrl } from '@/utils/image';
import * as z from 'zod';

export const SocialPlatformKey = z.enum([
  'apple',
  'deezer',
  'facebook',
  'instagram',
  'mixcloud',
  'spotify',
  'tiktok',
  'twitch',
  'twitter',
  'website',
  'youtube',
]);
export type SocialPlatformKey = z.infer<typeof SocialPlatformKey>;

export const SocialPlatformItem = z.object({
  key: SocialPlatformKey,
  enabled: z.boolean(),
});
export type SocialPlatformItem = z.infer<typeof SocialPlatformItem>;

export const SocialPlatformList = SocialPlatformItem.array();
export type SocialPlatformList = z.infer<typeof SocialPlatformList>;

export const SocialAttrs = z.object({
  platforms: SocialPlatformList.catch(
    SocialPlatformKey.options.map((key) => ({ key, enabled: true })),
  ),
  backgroundColor: z.string().nullable().catch(null),
  borderRadius: z.number().catch(24),
  color: z.string().nullable().catch(null),
  gap: z.number().catch(8),
});
export type SocialAttrs = z.infer<typeof SocialAttrs>;

export const getSocialAttrs = (attrs?: Attrs) => SocialAttrs.parse(attrs ?? {});
export const defaultSocialAttrs = getSocialAttrs();

export const platformMetadata = {
  apple: { urlKey: 'appleUrl', icon: 'applemusic.svg', name: 'Apple Music' },
  deezer: { urlKey: 'deezerUrl', icon: 'deezer.svg', name: 'Deezer' },
  facebook: { urlKey: 'facebookUrl', icon: 'facebook.svg', name: 'Facebook' },
  instagram: { urlKey: 'instagramUrl', icon: 'instagram.svg', name: 'Instagram' },
  mixcloud: { urlKey: 'mixcloudUrl', icon: 'mixcloud.svg', name: 'Mixcloud' },
  spotify: { urlKey: 'spotifyUrl', icon: 'spotify.svg', name: 'Spotify' },
  tiktok: { urlKey: 'tiktokUrl', icon: 'tiktok.svg', name: 'TikTok' },
  twitch: { urlKey: 'twitchUrl', icon: 'twitch.svg', name: 'Twitch' },
  twitter: { urlKey: 'twitterUrl', icon: 'x.svg', name: 'X (Twitter)' },
  website: { urlKey: 'websiteUrl', icon: 'globe.svg', name: 'Website' },
  youtube: { urlKey: 'youtubeUrl', icon: 'youtube.svg', name: 'YouTube' },
} as const;

export const getEnabledSocialPlatforms = (attrs: SocialAttrs, socialUrls: ArtistSocialUrls) => {
  return attrs.platforms
    .filter((platform) => platform.enabled && socialUrls[platformMetadata[platform.key].urlKey])
    .map((platform) => {
      const metadata = platformMetadata[platform.key];
      return {
        name: metadata.name,
        iconUrl: getIconUrl(metadata.icon),
        url: socialUrls[metadata.urlKey]!,
      };
    });
};
