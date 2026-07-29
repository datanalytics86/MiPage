'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface PhotoItem {
  id: string
  url: string
  alt?: string
}

interface PhotoGridProps {
  photos: PhotoItem[]
  onSelect?: (index: number) => void
  className?: string
  /** featured first cell spans 2×2 on md+ */
  featuredLayout?: boolean
  priorityCount?: number
}

export function PhotoGrid({
  photos,
  onSelect,
  className,
  featuredLayout = true,
  priorityCount = 1,
}: PhotoGridProps) {
  if (photos.length === 0) return null

  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3',
        className
      )}
    >
      {photos.map((photo, index) => {
        const isFeatured = featuredLayout && index === 0 && photos.length > 1
        return (
          <motion.button
            key={photo.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }}
            onClick={() => onSelect?.(index)}
            className={cn(
              'photo-frame group relative w-full text-left focus-visible:ring-2 focus-visible:ring-gold/50',
              isFeatured
                ? 'col-span-2 row-span-2 aspect-[4/3] md:aspect-auto md:min-h-[360px]'
                : 'aspect-portrait'
            )}
            aria-label={photo.alt || `Ver foto ${index + 1}`}
          >
            <Image
              src={photo.url}
              alt={photo.alt || `Foto ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 ease-premium group-hover:scale-105"
              sizes={
                isFeatured
                  ? '(max-width: 768px) 100vw, 66vw'
                  : '(max-width: 768px) 50vw, 33vw'
              }
              priority={index < priorityCount}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-base" />
          </motion.button>
        )
      })}
    </div>
  )
}
