import { apiService } from '@/api/api.service';
import { env } from '@/env';
import * as z from 'zod';

export const BandsInTownApi = 'https://rest.bandsintown.com';

export const BandsInTownDate = z.enum(['upcoming', 'past', 'all']);
export type BandsInTownDate = z.infer<typeof BandsInTownDate> | (string & {});

export const BandsInTownArtistData = z.object({
  bandsInTownArtistId: z.string(),
});
export type BandsInTownArtistData = z.infer<typeof BandsInTownArtistData>;

export const GetBandsInTownEventsData = z.object({
  bandsInTownArtistId: z.string(),
  date: z.custom<BandsInTownDate>((v) => typeof v === 'string'),
});
export type GetBandsInTownEventsData = z.infer<typeof GetBandsInTownEventsData>;

export const BandsInTownVenueItem = z.object({
  city: z.string().nullish(),
  country: z.string().nullish(),
  latitude: z.string().nullish(),
  location: z.string().nullish(),
  longitude: z.string().nullish(),
  name: z.string().nullish(),
  postal_code: z.string().nullish(),
  region: z.string().nullish(),
  street_address: z.string().nullish(),
});
export type BandsInTownVenueItem = z.infer<typeof BandsInTownVenueItem>;

export const BandsInTownOfferItem = z.object({
  type: z.string().nullish(),
  url: z.string().nullish(),
  status: z.string().nullish(),
});
export type BandsInTownOfferItem = z.infer<typeof BandsInTownOfferItem>;

export const BandsInTownArtistItem = z.object({
  artist_optin_show_phone_number: z.boolean().nullish(),
  facebook_page_url: z.string().nullish(),
  id: z.string(),
  image_url: z.string().nullish(),
  links: z
    .union([
      z.array(
        z
          .object({
            type: z.string().nullish(),
            url: z.string().nullish(),
          })
          .nullish(),
      ),
      z.string().nullish(),
    ])
    .nullish(),
  mbid: z.string().nullish(),
  name: z.string().nullish(),
  options: z.object({ display_listen_unit: z.boolean().nullish() }).nullish(),
  show_multi_ticket: z.boolean().nullish(),
  support_url: z.string().nullish(),
  thumb_url: z.string().nullish(),
  tracker_count: z.number().nullish(),
  tracking: z.array(z.any()).nullish(),
  upcoming_event_count: z.number().nullish(),
  url: z.string().nullish(),
});
export type BandsInTownArtistItem = z.infer<typeof BandsInTownArtistItem>;

export const BandsInTownPresaleItem = z.object({
  release_id: z.string().nullish(),
  presale_link: z.string().nullish(),
  presale_start_date: z.string().nullish(),
  presale_start_time: z.string().nullish(),
  presale_start_date_time: z.string().nullish(),
  presale_end_date: z.string().nullish(),
  presale_end_time: z.string().nullish(),
  presale_end_date_time: z.string().nullish(),
  short_link: z.string().nullish(),
  signup_after_presale_start: z.boolean().nullish(),
});
export type BandsInTownPresaleItem = z.infer<typeof BandsInTownPresaleItem>;

export const BandsInTownEventItem = z.object({
  artist_id: z.string().nullish(),
  artist: BandsInTownArtistItem.optional().nullable(),
  bandsintown_plus: z.boolean().nullish(),
  datetime_display_rule: z.string().nullish(),
  datetime: z.string().nullish(),
  description: z.string().nullish(),
  ends_at: z.string().nullish(),
  festival_datetime_display_rule: z.string().nullish(),
  festival_end_date: z.string().nullish(),
  festival_start_date: z.string().nullish(),
  free: z.boolean().nullish(),
  id: z.string(),
  lineup: z.array(z.string().nullish()).nullish(),
  offers: BandsInTownOfferItem.array().nullish(),
  on_sale_datetime: z.string().nullish(),
  presale: z.union([z.string().nullish(), BandsInTownPresaleItem.nullish()]).nullish(),
  sold_out: z.boolean().nullish(),
  starts_at: z.string().nullish(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  venue: BandsInTownVenueItem.nullish(),
});
export type BandsInTownEventItem = z.infer<typeof BandsInTownEventItem>;

export const BandsInTownEventList = z.array(BandsInTownEventItem).nullish();
export type BandsInTownEventList = z.infer<typeof BandsInTownEventList>;

export async function getBandsInTownArtist(data: BandsInTownArtistData, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${BandsInTownApi}/artists/id_${data.bandsInTownArtistId}/`,
      params: {
        app_id: env.VITE_BANDSINTOWN_API_KEY ?? '',
      },
    },
    BandsInTownArtistItem,
    { signal },
  );
}

export async function getBandsInTownEvents(data: GetBandsInTownEventsData, signal?: AbortSignal) {
  return apiService.request(
    {
      method: 'GET',
      url: `${BandsInTownApi}/artists/id_${data.bandsInTownArtistId}/events`,
      params: {
        app_id: env.VITE_BANDSINTOWN_API_KEY ?? '',
        date: data.date,
      },
    },
    BandsInTownEventList,
    { signal },
  );
}
