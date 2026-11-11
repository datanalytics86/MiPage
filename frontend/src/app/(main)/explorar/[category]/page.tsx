import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ExplorarContent } from '../ExplorarContent'
import { ProviderGridSkeleton } from '@/components/ui/Skeleton'

const STATIC_SLUGS = ['masajes', 'modelaje']

export function generateStaticParams() {
  return STATIC_SLUGS.map((category) => ({ category }))
}

/** Invalid slugs redirect to /explorar rather than platform 404. */
export const dynamicParams = true

interface CategoryPageProps {
  params: Promise<{ category: string }>
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: rawCategory } = await params
  const category = rawCategory?.toLowerCase() || ''
  if (!/^[a-z0-9-]{2,40}$/.test(category)) {
    redirect('/explorar')
  }

  return (
    <Suspense fallback={<ExplorarFallback />}>
      <ExplorarContent initialCategory={category} />
    </Suspense>
  )
}
