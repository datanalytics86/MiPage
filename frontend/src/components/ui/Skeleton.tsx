'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/10',
        className
      )}
    />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-dark-850 border border-white/10 overflow-hidden">
      {/* Image skeleton */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category & Rating */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Location */}
        <div className="pt-2 border-t border-white/5">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ServiceDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="rounded-2xl overflow-hidden">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="p-4 flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-[90vh] flex items-center bg-[#050308]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <Skeleton className="h-10 w-64" />
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-3/4" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
