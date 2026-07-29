/** Product filters & sort options (not demo data). */

export const filterCities = [
  'Todas',
  'Santiago',
  'Viña del Mar',
  'Concepción',
  'Valparaíso',
] as const

export const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más recientes' },
] as const

export type SortOptionValue = (typeof sortOptions)[number]['value']
