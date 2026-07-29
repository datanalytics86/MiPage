import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Optional Mercado Pago preference for featured listing.
 * If MERCADOPAGO_ACCESS_TOKEN is missing, returns 501 with clear message.
 */
const schema = z.object({
  providerId: z.string().uuid(),
  title: z.string().min(1).max(120).default('Destacar perfil MiPage'),
  unitPrice: z.number().int().positive().default(9990),
})

export async function POST(req: NextRequest) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json(
      {
        error: 'Mercado Pago not configured',
        configured: false,
        message: 'Set MERCADOPAGO_ACCESS_TOKEN to enable featured payments',
      },
      { status: 501 }
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { providerId, title, unitPrice } = parsed.data

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            currency_id: 'CLP',
            unit_price: unitPrice,
          },
        ],
        metadata: { providerId, product: 'featured_listing' },
        back_urls: {
          success: `${appUrl}/dashboard?featured=success`,
          failure: `${appUrl}/dashboard?featured=failure`,
          pending: `${appUrl}/dashboard?featured=pending`,
        },
        auto_return: 'approved',
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: 502 })
    }

    const data = (await res.json()) as { id: string; init_point?: string; sandbox_init_point?: string }
    return NextResponse.json({
      configured: true,
      preferenceId: data.id,
      initPoint: data.init_point || data.sandbox_init_point,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'MP error' },
      { status: 500 }
    )
  }
}
