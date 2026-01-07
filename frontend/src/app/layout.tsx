import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/ui/Toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'LuxeServices - Servicios Profesionales Premium',
  description: 'Descubre servicios profesionales de masajes terapéuticos y modelaje en Chile. Plataforma premium con perfiles verificados.',
  keywords: 'masajes, modelaje, servicios profesionales, Chile, Santiago',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-body antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
