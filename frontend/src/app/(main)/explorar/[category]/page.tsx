import { redirect } from 'next/navigation'
import { ExplorarContent } from '@/components/explorar/ExplorarContent'
import type { ProviderCategory } from '@/types'

interface CategoryPageProps {
  params: { category: string }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const validCategories: ProviderCategory[] = ['masajes', 'modelaje']

  if (!validCategories.includes(params.category as ProviderCategory)) {
    redirect('/explorar')
  }

  return <ExplorarContent initialCategory={params.category as ProviderCategory} />
}
