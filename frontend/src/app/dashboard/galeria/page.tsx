'use client'

import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2,
  Image as ImageIcon,
  Video,
  Star,
  Upload,
  X,
  Eye,
  Link as LinkIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import {
  useProviderGallery,
  useUploadGalleryFile,
  useDeleteGalleryItem,
  useSetGalleryCover,
  useAddGalleryUrl,
} from '@/hooks/useGallery'
import { useToast } from '@/stores/uiStore'

export default function DashboardGaleriaPage() {
  const toast = useToast()
  const { provider } = useAuth()
  const { data: gallery = [], isLoading } = useProviderGallery(provider?.id)
  const uploadFile = useUploadGalleryFile()
  const addUrl = useAddGalleryUrl()
  const deleteItem = useDeleteGalleryItem()
  const setCover = useSetGalleryCover()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlForm, setShowUrlForm] = useState(false)

  if (!provider) {
    return <p className="text-foreground-secondary">No tienes un perfil de proveedor asociado.</p>
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    const { validateUploadBatch } = await import('@/lib/uploadValidation')
    const batch = validateUploadBatch(files)
    if (!batch.ok) {
      toast.error('Archivo inválido', batch.message || 'Revisa tipo y tamaño')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile.mutateAsync({
          providerId: provider.id,
          file: files[i],
          isFirst: gallery.length === 0 && i === 0,
          sortOrder: gallery.length + i,
        })
      }
      toast.success(`${files.length} archivo(s) subido(s)`)
    } catch {
      toast.error('Error', 'No se pudo subir. Verifica el bucket "gallery" en Supabase.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return
    try {
      await addUrl.mutateAsync({
        providerId: provider.id,
        url: urlInput.trim(),
        isCover: gallery.length === 0,
        sortOrder: gallery.length,
      })
      setUrlInput('')
      setShowUrlForm(false)
      toast.success('Imagen agregada')
    } catch {
      toast.error('Error', 'URL inválida o error al guardar')
    }
  }

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('¿Eliminar este archivo?')) return
    try {
      await deleteItem.mutateAsync({ id, providerId: provider.id, url })
      toast.success('Eliminado')
    } catch {
      toast.error('Error', 'No se pudo eliminar')
    }
  }

  const handleSetCover = async (id: string) => {
    try {
      await setCover.mutateAsync({ id, providerId: provider.id })
      toast.success('Portada actualizada')
    } catch {
      toast.error('Error', 'No se pudo establecer como portada')
    }
  }

  const coverImage = gallery.find((g) => g.is_cover)
  const otherImages = gallery.filter((g) => !g.is_cover)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Mi Galería</h2>
          <p className="text-foreground-muted mt-1">Sube fotos a Supabase Storage o agrega URLs</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileSelect} className="hidden" />
          <Button variant="outline" onClick={() => setShowUrlForm(!showUrlForm)}>
            <LinkIcon className="h-4 w-4 mr-2" />
            URL
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
            <Upload className="h-5 w-5 mr-2" />
            {uploadFile.isPending ? 'Subiendo...' : 'Subir archivos'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showUrlForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-gold/30">
              <CardContent className="p-4 flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddUrl} disabled={addUrl.isPending}>Agregar</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      ) : gallery.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-4 text-foreground-muted" />
            <h3 className="font-display text-xl font-semibold mb-2">Sin fotos</h3>
            <p className="text-foreground-secondary mb-4">Sube tu primera imagen para el perfil público</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-5 w-5 mr-2" />
              Subir foto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {coverImage && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-gold" />
                Foto de portada
              </h3>
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden group">
                <img src={coverImage.url} alt="Portada" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="icon" onClick={() => setPreviewImage(coverImage.url)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" onClick={() => handleDelete(coverImage.id, coverImage.url)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge className="absolute top-3 left-3 bg-gold text-white">Portada</Badge>
              </div>
            </div>
          )}

          {otherImages.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Galería ({otherImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherImages.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                    {item.type === 'video' && (
                      <Badge className="absolute top-2 left-2 bg-black/60 text-white">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1">
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setPreviewImage(item.url)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleSetCover(item.id)}>
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id, item.url)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button className="absolute top-4 right-4 text-white" onClick={() => setPreviewImage(null)}>
              <X className="h-6 w-6" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}