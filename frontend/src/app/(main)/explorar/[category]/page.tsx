'use client'

import React from 'react'
import { redirect } from 'next/navigation'
import ExplorarPage from '../page'

interface CategoryPageProps {
  params: { category: string }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const validCategories = ['masajes', 'modelaje']

  if (!validCategories.includes(params.category)) {
    redirect('/explorar')
  }

  // TODO: Pass category filter to ExplorarPage
  return <ExplorarPage />
}
