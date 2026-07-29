'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ErrorState
        title="Algo salió mal"
        description="Ocurrió un error inesperado. Puedes reintentar o volver al inicio."
        onRetry={reset}
      />
    </div>
  )
}
