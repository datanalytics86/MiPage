'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Star,
  Upload,
  X,
  GripVertical,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  is_cover: boolean
  sort_order: number
  created_at: string
}

// Mock gallery data
const initialGallery: MediaItem[] = [
  {
    id: 'g1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    is_cover: true,
    sort_order: 0,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'g2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800',
    is_cover: false,
    sort_order: 1,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'g3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    is_cover: false,
    sort_order: 2,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'g4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800',
    is_cover: false,
    sort_order: 3,
    created_at: '2024-01-15T00:00:00Z',
  },
]

export default function DashboardGaleriaPage() {
  const [gallery, setGallery] = useState(initialGallery)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Simulate upload for each file
    const newItems: MediaItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isVideo = file.type.startsWith('video/')

      // Create preview URL
      const url = URL.createObjectURL(file)

      newItems.push({
        id: `g${Date.now()}-${i}`,
        type: isVideo ? 'video' : 'image',
        url,
        is_cover: gallery.length === 0 && i === 0,
        sort_order: gallery.length + i,
        created_at: new Date().toISOString(),
      })
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    setGallery([...gallery, ...newItems])
    setIsUploading(false)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este archivo?')) {
      const item = gallery.find(g => g.id === id)
      const newGallery = gallery.filter(g => g.id !== id)

      // If deleted item was cover, set first item as new cover
      if (item?.is_cover && newGallery.length > 0) {
        newGallery[0].is_cover = true
      }

      setGallery(newGallery)
    }
  }

  const handleSetCover = (id: string) => {
    setGallery(
      gallery.map(g => ({
        ...g,
        is_cover: g.id === id,
      }))
    )
  }

  const coverImage = gallery.find(g => g.is_cover)
  const otherImages = gallery.filter(g => !g.is_cover)

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Mi Galería
          </h2>
          <p className="text-foreground-muted mt-1">
            Sube fotos y videos para mostrar tu trabajo
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Subir archivos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Upload Tips */}
      <Card className="bg-gold/5 border-gold/20">
        <CardContent className="p-4">
          <div className="flex gap-4 text-sm">
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Recomendaciones</h4>
              <ul className="text-foreground-secondary space-y-1">
                <li>• Usa fotos de alta calidad (mínimo 800x600px)</li>
                <li>• Mantén un estilo consistente en todas las fotos</li>
                <li>• La foto de portada es la primera impresión</li>
              </ul>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Formatos aceptados</h4>
              <ul className="text-foreground-secondary space-y-1">
                <li>• Imágenes: JPG, PNG, WebP</li>
                <li>• Videos: MP4, MOV (máx. 30 seg)</li>
                <li>• Tamaño máximo: 10MB por archivo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Image */}
      {coverImage && (
        <div>
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-gold" />
            Foto de portada
          </h3>
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted group">
            <img
              src={coverImage.url}
              alt="Portada"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPreviewImage(coverImage.url)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleDelete(coverImage.id)}
                className="text-error hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Badge className="absolute top-3 left-3 bg-gold text-white">
              Portada
            </Badge>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {otherImages.length > 0 && (
        <div>
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Galería ({otherImages.length} {otherImages.length === 1 ? 'archivo' : 'archivos'})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherImages.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
              >
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Type badge */}
                {item.type === 'video' && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 bg-black/60 text-white"
                  >
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewImage(item.url)}
                    title="Ver"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSetCover(item.id)}
                    title="Establecer como portada"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 text-error hover:text-error"
                    onClick={() => handleDelete(item.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Drag handle */}
                <button className="absolute top-2 right-2 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {gallery.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Sin fotos
            </h3>
            <p className="text-foreground-secondary mb-4">
              Sube fotos de tu trabajo para que los clientes puedan ver tu estilo
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-5 w-5 mr-2" />
              Subir primera foto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
