'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function HomeSearch() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    router.push(q ? `/explorar?q=${encodeURIComponent(q)}` : '/explorar')
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-6">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Buscar por nombre, ciudad o servicio..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-12 pr-28 h-14 text-base rounded-2xl shadow-soft-lg border-gold/20 focus-visible:ring-gold/40"
        aria-label="Buscar profesionales"
      />
      <Button
        type="submit"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
      >
        Buscar
      </Button>
    </form>
  )
}
