import { formatPrice } from '@/lib/utils'

export type AdminProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type AdminUserRole = 'user' | 'provider' | 'admin'
export type AdminUserStatus = 'active' | 'suspended' | 'pending'
export type AdminReportType = 'profile' | 'review' | 'message' | 'photo'
export type AdminReportStatus = 'pending' | 'resolved' | 'dismissed'
export type AdminPriority = 'low' | 'medium' | 'high'

export interface AdminProvider {
  id: string
  name: string
  email: string
  category: string
  city: string
  status: AdminProviderStatus
  is_verified: boolean
  photo?: string
  rating: number
  review_count: number
  services_count: number
  price_min: number
  created_at: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  avatar?: string
  created_at: string
  last_login?: string
}

export interface AdminReport {
  id: string
  type: AdminReportType
  reason: string
  description: string
  status: AdminReportStatus
  priority: AdminPriority
  reporter: {
    name: string
    email: string
    avatar?: string
  }
  reported: {
    type: string
    name: string
    id: string
  }
  created_at: string
  resolved_at?: string
  resolved_by?: string
  resolution_note?: string
}

export const demoProviders: AdminProvider[] = [
  { id: '1', name: 'Valentina Rossi', email: 'valentina@email.com', category: 'Masajes', city: 'Santiago', status: 'approved', is_verified: true, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', rating: 4.9, review_count: 127, services_count: 5, price_min: 45000, created_at: '2024-03-10T00:00:00Z' },
  { id: '2', name: 'Isabella Montenegro', email: 'isabella@email.com', category: 'Modelaje', city: 'Viña del Mar', status: 'pending', is_verified: false, photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100', rating: 0, review_count: 0, services_count: 3, price_min: 60000, created_at: '2024-12-20T00:00:00Z' },
  { id: '3', name: 'Camila Delgado', email: 'camila@email.com', category: 'Fotografía', city: 'Providencia', status: 'approved', is_verified: false, photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100', rating: 5.0, review_count: 45, services_count: 4, price_min: 55000, created_at: '2024-06-15T00:00:00Z' },
  { id: '4', name: 'Sofía Martínez', email: 'sofia@email.com', category: 'Masajes', city: 'Las Condes', status: 'pending', is_verified: false, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', rating: 0, review_count: 0, services_count: 2, price_min: 40000, created_at: '2024-12-25T00:00:00Z' },
  { id: '5', name: 'Ana Fernández', email: 'ana@email.com', category: 'Modelaje', city: 'Ñuñoa', status: 'suspended', is_verified: true, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', rating: 4.2, review_count: 38, services_count: 3, price_min: 50000, created_at: '2024-02-20T00:00:00Z' },
]

export const demoUsers: AdminUser[] = [
  { id: '1', name: 'María González', email: 'maria@email.com', role: 'user', status: 'active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', created_at: '2024-01-15T00:00:00Z', last_login: '2024-12-28T10:30:00Z' },
  { id: '2', name: 'Carlos Rodríguez', email: 'carlos@email.com', role: 'user', status: 'active', created_at: '2024-02-20T00:00:00Z', last_login: '2024-12-27T15:45:00Z' },
  { id: '3', name: 'Valentina Rossi', email: 'valentina@email.com', role: 'provider', status: 'active', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', created_at: '2024-03-10T00:00:00Z', last_login: '2024-12-28T08:00:00Z' },
  { id: '4', name: 'Admin Principal', email: 'admin@luxeservices.com', role: 'admin', status: 'active', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', created_at: '2024-01-01T00:00:00Z', last_login: '2024-12-28T12:00:00Z' },
  { id: '5', name: 'Pedro López', email: 'pedro@email.com', role: 'user', status: 'suspended', created_at: '2024-04-05T00:00:00Z' },
  { id: '6', name: 'Isabella Montenegro', email: 'isabella@email.com', role: 'provider', status: 'pending', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100', created_at: '2024-12-20T00:00:00Z' },
]

export const demoReports: AdminReport[] = [
  { id: 'r1', type: 'profile', reason: 'Contenido inapropiado', description: 'El perfil contiene imágenes que violan los términos de servicio.', status: 'pending', priority: 'high', reporter: { name: 'Usuario Anónimo', email: 'user123@email.com' }, reported: { type: 'Proveedor', name: 'Proveedor XYZ', id: 'p123' }, created_at: '2024-12-28T10:30:00Z' },
  { id: 'r2', type: 'review', reason: 'Spam / Publicidad', description: 'La reseña contiene enlaces de publicidad a otros sitios web.', status: 'pending', priority: 'medium', reporter: { name: 'Valentina Rossi', email: 'valentina@email.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' }, reported: { type: 'Reseña', name: 'Reseña #1234', id: 'rev123' }, created_at: '2024-12-27T15:45:00Z' },
  { id: 'r3', type: 'message', reason: 'Acoso', description: 'El usuario envía mensajes intimidantes repetidamente.', status: 'pending', priority: 'high', reporter: { name: 'Isabella Montenegro', email: 'isabella@email.com', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100' }, reported: { type: 'Usuario', name: 'usuario_anonimo', id: 'u456' }, created_at: '2024-12-26T09:00:00Z' },
  { id: 'r4', type: 'photo', reason: 'Foto falsa', description: 'Las fotos del perfil no corresponden a la persona real.', status: 'resolved', priority: 'medium', reporter: { name: 'Carlos Rodríguez', email: 'carlos@email.com' }, reported: { type: 'Proveedor', name: 'Ana López', id: 'p789' }, created_at: '2024-12-20T14:00:00Z', resolved_at: '2024-12-22T10:00:00Z', resolved_by: 'Admin', resolution_note: 'Se verificó la identidad del proveedor.' },
  { id: 'r5', type: 'profile', reason: 'Información falsa', description: 'El proveedor afirma tener certificaciones no verificadas.', status: 'dismissed', priority: 'low', reporter: { name: 'Marcela Díaz', email: 'marcela@email.com' }, reported: { type: 'Proveedor', name: 'Laura Pérez', id: 'p303' }, created_at: '2024-12-10T09:00:00Z', resolved_at: '2024-12-11T09:30:00Z', resolved_by: 'Admin', resolution_note: 'No se halló evidencia suficiente.' },
]

export const adminDemoStats = [
  { name: 'Total Usuarios', value: '2,543', change: '+12.5%', trend: 'up', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Proveedores Activos', value: '186', change: '+8.2%', trend: 'up', color: 'text-gold', bg: 'bg-gold/10' },
  { name: 'Ingresos del Mes', value: formatPrice(12450000), change: '+23.1%', trend: 'up', color: 'text-success', bg: 'bg-success/10' },
  { name: 'Reportes Pendientes', value: String(demoReports.filter((r) => r.status === 'pending').length), change: '-2', trend: 'down', color: 'text-error', bg: 'bg-error/10' },
] as const

export const adminRecentProviders = demoProviders.slice(0, 3).map((provider) => ({
  id: provider.id,
  name: provider.name,
  email: provider.email,
  category: provider.category,
  status: provider.status,
  photo: provider.photo,
  created_at: provider.created_at,
}))

export const adminRecentReports = demoReports.slice(0, 3).map((report) => ({
  id: report.id,
  type: report.type,
  reason: report.reason,
  reporter: report.reporter.name,
  reported: report.reported.name,
  created_at: report.created_at,
  status: report.status,
}))
