import { Suspense } from 'react'
import { ExplorarContent } from './ExplorarContent'

function ExplorarFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-luxury py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-portrait rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
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