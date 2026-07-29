import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/** Base shimmer skeleton — avoid layout shift by matching final dimensions. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-muted relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-shimmer before:bg-gradient-to-r',
        'before:from-transparent before:via-white/[0.06] before:to-transparent',
        className
      )}
      aria-hidden
    />
  )
}

export function ProviderCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden border border-white/[0.06] bg-card',
        className
      )}
      role="status"
      aria-label="Cargando perfil"
    >
      <Skeleton className="aspect-portrait w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  )
}

export function ProviderGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="status"
      aria-label="Cargando resultados"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProviderCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PhotoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'aspect-portrait w-full rounded-xl',
            i === 0 && 'md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[320px]'
          )}
        />
      ))}
    </div>
  )
}

/** Admin / dashboard list rows */
export function ListRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Cargando lista">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-card"
        >
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

export function DashboardBlockSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Cargando">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
