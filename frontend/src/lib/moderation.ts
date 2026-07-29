/**
 * Smart moderation helpers — human-in-the-loop only.
 * Flags are suggestions; admin always decides.
 */

export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface ModerationInput {
  display_name?: string | null
  bio?: string | null
  city?: string | null
  category?: string | null
  photos?: string[] | null
  cover_photo?: string | null
  price_min?: number | null
  whatsapp?: string | null
  status?: ProviderStatus | string | null
}

export interface ModerationFlag {
  code: string
  severity: 'info' | 'warn' | 'high'
  message: string
}

const SPAM_PATTERNS =
  /(bit\.ly|t\.me\/|telegram\.me|onlyfans|xxx|gratis\s*total|whatsapp\s*\+?\d{8,})/i
const CONTACT_IN_BIO =
  /(\+?56\s?\d{8,9}|whatsapp|wsp|instagr?am\.com\/|@\w{3,})/i

/** Valid status transitions for marketplace listings (providers as listings). */
export function canTransitionStatus(
  from: ProviderStatus,
  to: ProviderStatus
): boolean {
  if (from === to) return true
  const map: Record<ProviderStatus, ProviderStatus[]> = {
    pending: ['approved', 'rejected', 'suspended'],
    approved: ['suspended', 'rejected', 'pending'],
    rejected: ['pending', 'approved'],
    suspended: ['approved', 'pending', 'rejected'],
  }
  return map[from]?.includes(to) ?? false
}

export function photoCount(input: ModerationInput): number {
  const fromArr = input.photos?.filter(Boolean).length ?? 0
  const cover = input.cover_photo ? 1 : 0
  return Math.max(fromArr, cover > 0 && fromArr === 0 ? 1 : fromArr)
}

/**
 * Analyze a provider row and return review flags (never auto-rejects).
 */
export function analyzeProviderFlags(input: ModerationInput): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  const name = (input.display_name || '').trim()
  const bio = (input.bio || '').trim()
  const photos = photoCount(input)

  if (!name || name.length < 2) {
    flags.push({
      code: 'NAME_SHORT',
      severity: 'high',
      message: 'Nombre público ausente o demasiado corto',
    })
  }

  if (photos === 0) {
    flags.push({
      code: 'NO_PHOTOS',
      severity: 'high',
      message: 'Sin fotos — la foto es el producto principal',
    })
  } else if (photos < 2) {
    flags.push({
      code: 'FEW_PHOTOS',
      severity: 'warn',
      message: 'Solo 1 foto — se recomiendan al menos 3',
    })
  }

  if (!bio || bio.length < 40) {
    flags.push({
      code: 'BIO_THIN',
      severity: 'warn',
      message: 'Bio incompleta (< 40 caracteres)',
    })
  }

  if (bio && SPAM_PATTERNS.test(bio)) {
    flags.push({
      code: 'BIO_SPAM',
      severity: 'high',
      message: 'Bio con posible spam o enlaces no permitidos',
    })
  }

  if (bio && CONTACT_IN_BIO.test(bio)) {
    flags.push({
      code: 'CONTACT_IN_BIO',
      severity: 'warn',
      message: 'Posible contacto directo en bio (revisar política)',
    })
  }

  if (!input.city?.trim()) {
    flags.push({
      code: 'NO_CITY',
      severity: 'warn',
      message: 'Sin ciudad',
    })
  }

  if (
    input.price_min != null &&
    (input.price_min < 5000 || input.price_min > 5_000_000)
  ) {
    flags.push({
      code: 'PRICE_ODD',
      severity: 'info',
      message: 'Precio fuera de rango habitual — verificar',
    })
  }

  const cat = (input.category || '').toLowerCase()
  if (cat && cat !== 'masajes' && cat !== 'modelaje') {
    flags.push({
      code: 'CATEGORY_UNKNOWN',
      severity: 'info',
      message: `Categoría no estándar: ${input.category}`,
    })
  }

  return flags
}

export function moderationRiskScore(flags: ModerationFlag[]): number {
  return flags.reduce((sum, f) => {
    if (f.severity === 'high') return sum + 3
    if (f.severity === 'warn') return sum + 2
    return sum + 1
  }, 0)
}

/** Sort pending queue: highest risk first, then oldest. */
export function comparePendingForQueue(
  a: ModerationInput & { created_at?: string; flags?: ModerationFlag[] },
  b: ModerationInput & { created_at?: string; flags?: ModerationFlag[] }
): number {
  const fa = a.flags ?? analyzeProviderFlags(a)
  const fb = b.flags ?? analyzeProviderFlags(b)
  const diff = moderationRiskScore(fb) - moderationRiskScore(fa)
  if (diff !== 0) return diff
  const ta = a.created_at ? Date.parse(a.created_at) : 0
  const tb = b.created_at ? Date.parse(b.created_at) : 0
  return ta - tb
}

export function summarizeAdminDay(stats: {
  pendingProviders: number
  pendingReports: number
  approvedToday?: number
}): string {
  const parts: string[] = []
  if (stats.pendingProviders > 0) {
    parts.push(`${stats.pendingProviders} aviso(s) pendiente(s)`)
  }
  if (stats.pendingReports > 0) {
    parts.push(`${stats.pendingReports} reporte(s)`)
  }
  if (stats.approvedToday) {
    parts.push(`${stats.approvedToday} aprobados hoy`)
  }
  if (parts.length === 0) return 'Cola limpia — sin pendientes críticos'
  return parts.join(' · ')
}
