import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiActor } from '@/lib/api/actor'
import { featuredPriceFromSettings } from '@/lib/featuredPrice'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const schema = z.object({
  providerId: z.string().uuid(),
  title: z.string().min(1).max(120).optional(),
})

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()),
  })
}

/**
 * Preferencia de Mercado Pago. El precio sale del servidor.
 * Sin webhook en esta fase: pagar no activa el Destacado (fase 4 lo deja manual).
 */
export async function POST(req: NextRequest) {
  const actor = await getApiActor()
  if (!actor) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: provider } = await supabase
    .from('providers')
    .select('id, user_id')
    .eq('id', parsed.data.providerId)
    .maybeSingle()

  if (!provider || provider.user_id !== actor.id) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
  if (!token) {
    return NextResponse.json(
      {
        error: 'Mercado Pago no está configurado',
        configured: false,
        message:
          'El pago de Destacado no está configurado. Un administrador puede marcar tu perfil como Destacado desde el panel.',
      },
      { status: 501 }
    )
  }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'payments')
    .maybeSingle()

  const unitPrice = featuredPriceFromSettings(settings?.value)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const title = parsed.data.title || 'Destacar perfil MiPage'

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
        metadata: { providerId: provider.id, product: 'featured_listing' },
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
      { error: e instanceof Error ? e.message : 'Error de Mercado Pago' },
      { status: 500 }
    )
  }
}
