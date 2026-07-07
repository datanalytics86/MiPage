import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  reason: z.enum(['general', 'support', 'report']),
  message: z.string().trim().min(10).max(4000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Tier 1: persistimos en logs del servidor; integración SendGrid puede activarse con SENDGRID_API_KEY.
    console.info('[contact]', {
      at: new Date().toISOString(),
      reason: data.reason,
      email: data.email,
      name: data.name,
      messagePreview: data.message.slice(0, 120),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Datos inválidos', details: error.flatten() },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 })
  }
}