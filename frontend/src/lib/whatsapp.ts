/**
 * Build a WhatsApp deep link with short prefilled message (visitor journey).
 */
export function buildWhatsAppLink(
  rawPhone: string | null | undefined,
  displayName: string,
  options?: { source?: string }
): string | null {
  if (!rawPhone?.trim()) return null
  // digits only, keep leading country code if present
  const digits = rawPhone.replace(/\D/g, '')
  if (digits.length < 8) return null

  const source = options?.source || 'MiPage'
  const text = `Hola ${displayName}, vi tu perfil en ${source} y me gustaría coordinar. ¿Tienes disponibilidad?`

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
