import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="relative mb-8">
          <span className="font-display text-[150px] md:text-[200px] font-bold text-muted leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl md:text-5xl font-semibold text-foreground">
              Oops!
            </span>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-display text-2xl font-semibold text-foreground mb-4">
          Página no encontrada
        </h1>
        <p className="text-foreground-secondary mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
          ¿Por qué no exploras nuestros servicios?
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
          <Link href="/explorar">
            <Button variant="outline" className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Explorar servicios
            </Button>
          </Link>
        </div>

        {/* Help text */}
        <p className="text-sm text-foreground-muted mt-8">
          Si crees que esto es un error,{' '}
          <Link href="/contacto" className="text-gold hover:underline">
            contáctanos
          </Link>
        </p>
      </div>
    </div>
  )
}
