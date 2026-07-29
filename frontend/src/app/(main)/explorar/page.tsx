import { Suspense } from 'react'
import { ExplorarContent } from './ExplorarContent'
import { ProviderGridSkeleton } from '@/components/ui/Skeleton'

function ExplorarFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-luxury py-8">
        <ProviderGridSkeleton count={8} />
      </div>
    </div>
  )
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<ExplorarFallback />}>
      <ExplorarContent />
    </Suspense>
  )
}
