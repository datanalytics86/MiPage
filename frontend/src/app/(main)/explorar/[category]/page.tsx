'use client'

import React from 'react'
import { redirect } from 'next/navigation'
import ExplorarPage from '../page'
import type { ProviderCategory } from '@/types'

interface CategoryPageProps {
  params: { category: string }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const validCategories: ProviderCategory[] = ['masajes', 'modelaje']

  if (!validCategories.includes(params.category as ProviderCategory)) {
    redirect('/explorar')
  }

  // Pass the category as initial filter to ExplorarPage
  return <ExplorarPage initialCategory={params.category as ProviderCategory} />
}
