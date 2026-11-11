/**
 * Crea el primer administrador. Única tarea de terminal del dueño.
 * Uso, desde frontend/: npm run admin:create -- correo@dominio.cl
 * La cuenta debe existir (la persona ya se registró). No imprime secretos.
 */
import { createClient } from '@supabase/supabase-js'

const email = (process.argv[2] || '').trim().toLowerCase()
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!email || !email.includes('@')) {
  console.error('Uso: npm run admin:create -- correo@dominio.cl')
  process.exit(1)
}
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: profile, error } = await admin
  .from('profiles')
  .update({ role: 'admin' })
  .eq('email', email)
  .select('id, email, role')
  .maybeSingle()

if (error) {
  console.error('No se pudo actualizar el perfil.')
  process.exit(1)
}
if (!profile) {
  console.error('No hay un perfil con ese correo. La persona debe registrarse primero.')
  process.exit(1)
}

console.log(`Listo: ${profile.email} ahora es ${profile.role}. Entra en /admin.`)
