import { redirect } from 'next/navigation'
import type { ProviderCategory } from '@/types'

interface CategoryPageProps {
  params: { category: string }
}

function isProviderCategory(category: string): category is ProviderCategory {
  return category === 'masajes' || category === 'modelaje'
}

export default function CategoryPage({ params }: CategoryPageProps) {
  if (!isProviderCategory(params.category)) {
    redirect('/explorar')
  }

  redirect(`/explorar?category=${params.category}`)
}
