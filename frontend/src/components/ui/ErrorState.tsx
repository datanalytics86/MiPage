'use client'

import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  homeHref?: string
  className?: string
}

export function ErrorState({
  title = 'Algo salió mal',
  description = 'Ocurrió un error inesperado. Puedes reintentar o volver al inicio.',
  onRetry,
  homeHref = '/',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-16',
        className
      )}
      role="alert"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 border border-error/20">
        <AlertTriangle className="h-7 w-7 text-error" aria-hidden />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
        {title}
      </h2>
      <p className="text-foreground-secondary max-w-md mb-8">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button type="button" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
            Reintentar
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href={homeHref}>Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
