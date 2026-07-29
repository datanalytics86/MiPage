'use client'

import React, { useCallback, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PhotoItem } from '@/components/ui/PhotoGrid'

interface GalleryLightboxProps {
  photos: PhotoItem[]
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
  className?: string
}

export function GalleryLightbox({
  photos,
  index,
  onClose,
  onChange,
  className,
}: GalleryLightboxProps) {
  const open = index !== null && photos.length > 0
  const current = open ? photos[index!] : null

  const go = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return
      const next = (index + delta + photos.length) % photos.length
      onChange(next)
    },
    [index, onChange, photos.length]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, go])

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className={cn(
            'fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-sm',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Galería de fotos"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 rounded-full glass-strong text-foreground hover:bg-white/10 transition-colors"
            aria-label="Cerrar galería"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(-1)
                }}
                className="absolute left-3 md:left-6 z-10 p-3 rounded-full glass-strong text-foreground hover:bg-white/10"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(1)
                }}
                className="absolute right-3 md:right-6 z-10 p-3 rounded-full glass-strong text-foreground hover:bg-white/10"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.div
            key={current.id}
            className="relative w-full max-w-5xl h-[70vh] md:h-[80vh] mx-12"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.url}
              alt={current.alt || 'Foto'}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </motion.div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-foreground-secondary glass px-4 py-2 rounded-full">
            {(index ?? 0) + 1} / {photos.length}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
