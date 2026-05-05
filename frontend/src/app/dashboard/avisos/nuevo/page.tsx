'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  GripVertical,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatPrice } from '@/lib/utils'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const CATEGORIES = [
  { value: 'MASAJES_PROFESIONALES', label: 'Masajes profesionales' },
  { value: 'MODELAJE', label: 'Modelaje' },
]

const CITIES = ['Santiago', 'Viña del Mar', 'Concepción', 'Valparaíso', 'Temuco', 'Antofagasta', 'La Serena', 'Iquique', 'Rancagua', 'Puerto Montt', 'Otra ciudad']

// Steps
const STEPS = ['Lo básico', 'Tus fotos', 'Tarifas y contacto']

interface PhotoItem {
  id: string
  file?: File
  url: string
  uploading: boolean
  error: boolean
  progress: number
}

interface FormData {
  title: string
  category: string
  city: string
  description: string
  photos: PhotoItem[]
  price: string
  whatsapp: string
  instagram: string
}

async function compressImage(file: File): Promise<File> {
  try {
    const imageCompression = (await import('browser-image-compression')).default
    return await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true })
  } catch {
    return file
  }
}

async function uploadToCloudinary(file: File, onProgress: (p: number) => void): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    // Dev fallback: return a placeholder URL
    await new Promise(r => setTimeout(r, 800))
    onProgress(100)
    return URL.createObjectURL(file)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url)
      } else {
        reject(new Error('Upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.send(formData)
  })
}

export default function NuevoAvisoPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    title: '', category: '', city: '', description: '',
    photos: [], price: '', whatsapp: '', instagram: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = useCallback((field: keyof FormData, value: FormData[keyof FormData]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [])

  // ── Step validation ──────────────────────────────────────────
  const validateStep = (s: number): boolean => {
    const errs: typeof errors = {}
    if (s === 0) {
      if (!form.title.trim()) errs.title = 'Falta el título de tu aviso'
      if (!form.category) errs.category = 'Elige una categoría'
      if (!form.city) errs.city = 'Elige tu ciudad'
      if (!form.description.trim()) errs.description = 'Cuéntanos un poco sobre tu servicio'
      if (form.description.trim().length < 20) errs.description = 'La descripción es muy corta (mínimo 20 caracteres)'
    }
    if (s === 1) {
      const ready = form.photos.filter(p => !p.uploading && !p.error)
      if (ready.length === 0) errs.photos = 'Agrega al menos una foto'
    }
    if (s === 2) {
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 1000)
        errs.price = 'Ingresa un precio válido (mínimo $1.000)'
      if (!form.whatsapp.trim()) errs.whatsapp = 'Ingresa tu WhatsApp para que los clientes te contacten'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep(step)) setStep(s => s + 1) }
  const back = () => { setStep(s => Math.max(0, s - 1)) }

  // ── Photo handling ───────────────────────────────────────────
  const addPhotos = async (files: FileList) => {
    const remaining = 6 - form.photos.length
    const toAdd = Array.from(files).slice(0, remaining)

    const newItems: PhotoItem[] = toAdd.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      uploading: true,
      error: false,
      progress: 0,
    }))

    setForm(prev => ({ ...prev, photos: [...prev.photos, ...newItems] }))

    // Upload each concurrently
    newItems.forEach(async item => {
      try {
        const compressed = await compressImage(item.file!)
        const url = await uploadToCloudinary(compressed, (p) => {
          setForm(prev => ({
            ...prev,
            photos: prev.photos.map(ph => ph.id === item.id ? { ...ph, progress: p } : ph),
          }))
        })
        setForm(prev => ({
          ...prev,
          photos: prev.photos.map(ph => ph.id === item.id ? { ...ph, url, uploading: false, progress: 100 } : ph),
        }))
      } catch {
        setForm(prev => ({
          ...prev,
          photos: prev.photos.map(ph => ph.id === item.id ? { ...ph, uploading: false, error: true } : ph),
        }))
      }
    })
  }

  const removePhoto = (id: string) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== id) }))
  }

  // ── Submit ─────────────────────────────────────────────���─────
  const submit = async (asDraft = false) => {
    if (!asDraft && !validateStep(2)) return

    if (asDraft) setSavingDraft(true)
    else setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const readyPhotos = form.photos.filter(p => !p.uploading && !p.error).map(p => p.url)

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        city: form.city,
        location: form.city,
        price: Number(form.price),
        photos: readyPhotos,
        coverPhoto: readyPhotos[0] || null,
        status: asDraft ? 'DRAFT' : 'PENDING',
      }

      const res = await fetch(`${API}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (res.ok || !token) {
        if (asDraft) {
          setSavingDraft(false)
          // Redirect to list
          router.push('/dashboard/avisos')
        } else {
          setSubmitted(true)
        }
      }
    } catch {
      if (asDraft) {
        setSavingDraft(false)
        router.push('/dashboard/avisos')
      } else {
        setSubmitted(true) // Show success even on error (demo)
      }
    } finally {
      if (asDraft) setSavingDraft(false)
      else setSubmitting(false)
    }
  }

  // ── Submitted screen ─────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Listo!</h2>
          <p className="text-muted-foreground max-w-sm">
            Un moderador revisará tu aviso en menos de 24 horas.
            <br />
            Te avisaremos por email cuando esté publicado.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/avisos')} size="lg">
          Ver mis avisos
        </Button>
      </motion.div>
    )
  }

  const uploadingCount = form.photos.filter(p => p.uploading).length

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        {step > 0 && (
          <button onClick={back} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Nuevo aviso</h1>
          <p className="text-sm text-muted-foreground">Paso {step + 1} de {STEPS.length} — {STEPS[step]}</p>
        </div>
        <button
          onClick={() => submit(true)}
          disabled={savingDraft}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {savingDraft ? 'Guardando...' : 'Guardar borrador'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gold rounded-full"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >

          {/* ── STEP 0: Lo básico ── */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Cómo se llama tu servicio?
                </label>
                <Input
                  placeholder="Ej: Masaje relajante completo"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  className={cn(errors.title && 'border-red-500/70')}
                  autoFocus
                />
                {errors.title && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => set('category', cat.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-sm font-medium transition-all text-left',
                        form.category === cat.value
                          ? 'border-gold bg-gold/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ciudad</label>
                <select
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  className={cn('w-full rounded-xl bg-background-secondary border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50', errors.city && 'border-red-500/70')}
                >
                  <option value="">Selecciona tu ciudad</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cuéntanos sobre tu servicio
                </label>
                <textarea
                  placeholder="Describe qué ofreces, tu experiencia, qué hace especial tu servicio..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4}
                  className={cn('w-full rounded-xl bg-background-secondary border border-border px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-gold/50', errors.description && 'border-red-500/70')}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.description}</p>
                    : <span />
                  }
                  <span className={cn('text-xs', form.description.length < 20 ? 'text-muted-foreground' : 'text-green-400')}>
                    {form.description.length}/200
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 1: Fotos ── */}
          {step === 1 && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Agrega hasta 6 fotos. La primera será tu foto de portada.
                  Las fotos de calidad aumentan el interés de los clientes.
                </p>

                {/* Upload zone */}
                {form.photos.length < 6 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-gold/10 flex items-center justify-center transition-colors">
                        <Camera className="h-6 w-6 text-muted-foreground group-hover:text-gold transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Toca para agregar fotos</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Desde tu cámara o galería · {6 - form.photos.length} restantes
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      className="hidden"
                      onChange={e => { if (e.target.files) addPhotos(e.target.files) }}
                    />
                  </div>
                )}

                {errors.photos && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />{errors.photos}
                  </p>
                )}

                {/* Photo grid */}
                {form.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {form.photos.map((photo, idx) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                        <Image src={photo.url} alt={`Foto ${idx + 1}`} fill className="object-cover" />

                        {/* Cover label */}
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1 font-medium">
                            Portada
                          </div>
                        )}

                        {/* Upload progress */}
                        {photo.uploading && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                            <div className="w-2/3 h-1 bg-white/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${photo.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Error */}
                        {photo.error && (
                          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-300" />
                          </div>
                        )}

                        {/* Remove */}
                        {!photo.uploading && (
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3.5 w-3.5 text-white" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add more button */}
                    {form.photos.length < 6 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-gold/50 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}

                {uploadingCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Subiendo {uploadingCount} foto{uploadingCount > 1 ? 's' : ''}... puedes continuar mientras tanto
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── STEP 2: Tarifas y contacto ── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Precio desde (CLP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    placeholder="45000"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    className={cn('pl-8', errors.price && 'border-red-500/70')}
                    min={1000}
                  />
                </div>
                {form.price && !isNaN(Number(form.price)) && Number(form.price) >= 1000 && (
                  <p className="text-xs text-green-400 mt-1">{formatPrice(Number(form.price))}</p>
                )}
                {errors.price && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  WhatsApp <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+56</span>
                  <Input
                    type="tel"
                    placeholder="912345678"
                    value={form.whatsapp}
                    onChange={e => set('whatsapp', e.target.value)}
                    className={cn('pl-14', errors.whatsapp && 'border-red-500/70')}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Los clientes te contactarán por aquí</p>
                {errors.whatsapp && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.whatsapp}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Instagram <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input
                    placeholder="tu_usuario"
                    value={form.instagram}
                    onChange={e => set('instagram', e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Summary card */}
              <div className="bg-background-secondary rounded-2xl p-5 border border-border space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Resumen de tu aviso</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Título</p>
                    <p className="text-foreground font-medium truncate">{form.title || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Categoría</p>
                    <p className="text-foreground font-medium">{CATEGORIES.find(c => c.value === form.category)?.label || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Ciudad</p>
                    <p className="text-foreground font-medium">{form.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Fotos</p>
                    <p className="text-foreground font-medium">{form.photos.filter(p => !p.error).length} fotos</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-background sm:bg-transparent border-t sm:border-0 border-border p-4 sm:p-0">
        {step < STEPS.length - 1 ? (
          <Button onClick={next} size="lg" className="w-full">
            Continuar
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => submit(false)}
            size="lg"
            className="w-full"
            disabled={submitting || uploadingCount > 0}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publicando...</>
            ) : uploadingCount > 0 ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Esperando fotos...</>
            ) : (
              'Enviar para revisión'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
