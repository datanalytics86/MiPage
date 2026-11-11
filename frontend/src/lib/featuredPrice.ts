/** Server-side price for a featured listing. The client never sets this. */
export const DEFAULT_FEATURED_PRICE_CLP = 9990

export function featuredPriceFromSettings(value: unknown): number {
  if (value && typeof value === 'object' && value !== null && 'featuredPrice' in value) {
    const raw = (value as { featuredPrice?: unknown }).featuredPrice
    const n = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isInteger(n) && n > 0 && n <= 5_000_000) return n
  }

  const env = Number(process.env.FEATURED_PRICE_CLP)
  if (Number.isInteger(env) && env > 0 && env <= 5_000_000) return env

  return DEFAULT_FEATURED_PRICE_CLP
}
