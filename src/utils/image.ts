const OPENSTAGE_IMG_CDN = 'https://img.openstage.live';

/** URL for an Openstage CDN icon (matches fanzone). */
export function getIconUrl(icon: string): string {
  return `${OPENSTAGE_IMG_CDN}/icons/${icon}`;
}
