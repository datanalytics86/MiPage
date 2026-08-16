import { describe, it, expect } from 'vitest'
import { formatStatValue } from '../stats'

describe('formatStatValue', () => {
  it('shows em dash when data is missing', () => {
    expect(formatStatValue(null)).toBe('—')
    expect(formatStatValue(Number.NaN)).toBe('—')
  })

  it('shows real zero instead of invented scale', () => {
    expect(formatStatValue(0)).toBe('0')
  })

  it('formats ratings with one decimal', () => {
    expect(formatStatValue(4.86, { decimals: 1 })).toBe('4.9')
  })
})
