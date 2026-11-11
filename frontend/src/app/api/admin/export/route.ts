import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const kind = new URL(req.url).searchParams.get('kind')

  if (kind === 'users') {
    const { data, error } = await gate.supabase
      .from('profiles')
      .select('id, email, name, role, is_suspended, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (error) return NextResponse.json({ error: 'No se pudo exportar' }, { status: 500 })
    const lines = [
      'id,email,name,role,is_suspended,created_at',
      ...(data || []).map((row) =>
        [row.id, row.email, row.name, row.role, row.is_suspended, row.created_at].map(csvCell).join(',')
      ),
    ]
    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="usuarios.csv"',
      },
    })
  }

  if (kind === 'providers') {
    const { data, error } = await gate.supabase
      .from('providers')
      .select('id, slug, display_name, category, city, status, is_featured, featured_until, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (error) return NextResponse.json({ error: 'No se pudo exportar' }, { status: 500 })
    const lines = [
      'id,slug,display_name,category,city,status,is_featured,featured_until,user_id,created_at',
      ...(data || []).map((row) =>
        [
          row.id,
          row.slug,
          row.display_name,
          row.category,
          row.city,
          row.status,
          row.is_featured,
          row.featured_until,
          row.user_id,
          row.created_at,
        ]
          .map(csvCell)
          .join(',')
      ),
    ]
    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="proveedores.csv"',
      },
    })
  }

  return NextResponse.json({ error: 'kind debe ser users o providers' }, { status: 400 })
}
