import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center w-full max-w-xs">
        <div className="relative w-14 h-14 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
          <div className="absolute inset-0 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="font-display text-xl font-semibold text-foreground mb-4">
          Mi<span className="text-gold">Page</span>
        </p>
        <Skeleton className="h-2 w-32 mx-auto rounded-full" />
        <p className="sr-only">Cargando…</p>
      </div>
    </div>
  )
}
