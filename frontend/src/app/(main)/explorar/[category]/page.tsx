import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ExplorarContent } from '../ExplorarContent'
import { ProviderGridSkeleton } from '@/components/ui/Skeleton'
import type { ProviderCategory } from '@/types'

interface CategoryPageProps {
  params: { category: string }
}

function ExplorarFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-luxury py-8">
        <ProviderGridSkeleton count={8} />
      </div>
    </div>
  )
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const validCategories: ProviderCategory[] = ['masajes', 'modelaje']

  if (!validCategories.includes(params.category as ProviderCategory)) {
    redirect('/explorar')
  }

  return (
    <Suspense fallback={<ExplorarFallback />}>
      <ExplorarContent initialCategory={params.category as ProviderCategory} />
    </Suspense>
  )
}
