export type PublicMarketplaceStats = {
  activeProviders: number | null
  reviews: number | null
  averageRating: number | null
  cities: number | null
}

export const EMPTY_PUBLIC_STATS: PublicMarketplaceStats = {
  activeProviders: null,
  reviews: null,
  averageRating: null,
  cities: null,
}

/** Honest display: never invent scale. Null → em dash. */
export function formatStatValue(
  value: number | null,
  options?: { decimals?: number }
): string {
  if (value === null || Number.isNaN(value)) return '—'
  if (options?.decimals !== undefined) {
    return value.toFixed(options.decimals)
  }
  return String(value)
}
