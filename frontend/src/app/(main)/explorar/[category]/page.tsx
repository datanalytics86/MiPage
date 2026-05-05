'use client'

import { redirect } from 'next/navigation'
import { ExplorarView } from '@/components/explorar/ExplorarView'
import type { ProviderCategory } from '@/types'

interface CategoryPageProps {
  params: { category: string }
}

const VALID_CATEGORIES: Record<string, ProviderCategory> = {
  masajes: 'masajes',
  modelaje: 'modelaje',
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = VALID_CATEGORIES[params.category]

  if (!category) {
    redirect('/explorar')
  }

  return <ExplorarView initialCategory={category} />
}
