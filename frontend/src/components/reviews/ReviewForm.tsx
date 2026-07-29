'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from './StarRating'
import { cn } from '@/lib/utils'
import { DARK_BLUR_DATA_URL_CLIENT } from '@/lib/image'

interface ReviewFormProps {
  providerName: string
  providerPhoto?: string
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>
  onClose: () => void
  isOpen: boolean
}

const ratingLabels: Record<number, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
}

export function ReviewForm({
  providerName,
  providerPhoto,
  onSubmit,
  onClose,
  isOpen,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ rating, comment: comment.trim() })
      setRating(0)
      setComment('')
      onClose()
    } catch (err) {
      setError('Error al enviar la reseña. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0)
      setComment('')
      setError('')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <Card className="shadow-2xl">
              <CardHeader className="relative pb-4">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors text-foreground-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                <CardTitle className="font-display text-xl">Escribir reseña</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Provider Info */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {providerPhoto && (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={providerPhoto}
                          alt={providerName}
                          fill
                          className="object-cover"
                          sizes="48px"
                          placeholder="blur"
                          blurDataURL={DARK_BLUR_DATA_URL_CLIENT}
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-foreground-muted">Reseña para</p>
                      <p className="font-medium text-foreground">{providerName}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-3">
                      ¿Cómo calificarías tu experiencia?
                    </p>
                    <div className="flex justify-center mb-2">
                      <StarRating
                        rating={rating}
                        size="xl"
                        interactive
                        onRatingChange={setRating}
                      />
                    </div>
                    {rating > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'text-sm font-medium',
                          rating >= 4 ? 'text-success' :
                          rating >= 3 ? 'text-warning' :
                          'text-error'
                        )}
                      >
                        {ratingLabels[rating]}
                      </motion.p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tu opinión
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="input-luxury resize-none w-full"
                      rows={4}
                      placeholder="Cuéntanos sobre tu experiencia..."
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-foreground-muted text-right">
                      {comment.length}/500 caracteres
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-error/10 text-error text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || rating === 0}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        'Enviando...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publicar reseña
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Inline review form for embedding in pages
export function ReviewFormInline({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>
  onCancel?: () => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ rating, comment: comment.trim() })
      setRating(0)
      setComment('')
    } catch (err) {
      setError('Error al enviar la reseña. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Calificación
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onRatingChange={setRating}
          />
          {rating > 0 && (
            <span className="text-sm text-foreground-muted">
              {ratingLabels[rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Comentario
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-luxury resize-none w-full"
          rows={3}
          placeholder="Cuéntanos sobre tu experiencia..."
          disabled={isSubmitting}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
        </Button>
      </div>
    </form>
  )
}
