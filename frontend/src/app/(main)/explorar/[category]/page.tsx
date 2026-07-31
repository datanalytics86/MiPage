import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ExplorarContent } from '../ExplorarContent'
import { ProviderGridSkeleton } from '@/components/ui/Skeleton'
import type { ProviderCategory } from '@/types'

/** Allowed category slugs — keep in sync with nav/header/footer. */
const CATEGORY_SLUGS: ProviderCategory[] = ['masajes', 'modelaje']

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }))
}

/** Invalid slugs redirect to /explorar rather than platform 404. */
export const dynamicParams = true

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
  const category = params.category?.toLowerCase()
  const valid = CATEGORY_SLUGS.includes(category as ProviderCategory)

  if (!valid) {
    redirect('/explorar')
  }

  return (
    <Suspense fallback={<ExplorarFallback />}>
      <ExplorarContent initialCategory={category as ProviderCategory} />
    </Suspense>
  )
}
