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
