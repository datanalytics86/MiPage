'use client'

import React, { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { generateSlug, cn } from '@/lib/utils'
import {
  validateUploadBatch,
  validateUploadFile,
  sanitizePlainText,
} from '@/lib/uploadValidation'
import {
  DEFAULT_METADATA_FIELDS,
  validateMetadataValues,
  type MetadataValues,
} from '@/lib/metadataFields'
import { useToast } from '@/stores/uiStore'

const cleanText = sanitizePlainText

const STEPS = ['Datos básicos', 'Fotos', 'Servicios y envío'] as const

const STEP_HINTS = [
  'Usa tu nombre público real. Las fotos se revisan antes de publicarte.',
  'Mínimo 3 fotos nítidas (rostro y servicio). Puedes reordenar después en Galería.',
  'Define un precio desde y un servicio. Al enviar queda en revisión (PENDING).',
] as const

export default function NuevoAvisoWizardPage() {
  const router = useRouter()
  const toast = useToast()
  const { provider, profile, refreshProfile, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    display_name: provider?.display_name || profile?.name || '',
    category: (provider?.category as string) || 'masajes',
    city: provider?.city || 'Santiago',
    bio: provider?.bio || '',
    whatsapp: provider?.whatsapp || '',
    instagram: provider?.instagram || '',
    price_min: provider?.price_min?.toString() || '',
    service_name: '',
    service_price: '',
    service_duration: '60 min',
  })
  const [metadata, setMetadata] = useState<MetadataValues>({ years_experience: 1 })
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const metaFields = useMemo(
    () =>
      DEFAULT_METADATA_FIELDS.filter(
        (f) => f.applies_to.includes('*') || f.applies_to.includes(form.category)
      ),
    [form.category]
  )

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-foreground-muted">
        Cargando wizard…
      </div>
    )
  }

  if (!hasSupabaseEnv()) {
    return (
      <Card className="border-warning/30">
        <CardContent className="p-8 text-center space-y-2">
          <p className="font-display text-xl font-semibold">Supabase no configurado</p>
          <p className="text-foreground-secondary text-sm">
            Configura las variables de entorno para publicar avisos con fotos reales.
          </p>
        </CardContent>
      </Card>
    )
  }

  const validateStep0 = () => {
    const e: Record<string, string> = {}
    if (!form.display_name.trim()) e.display_name = 'Nombre público requerido'
    if (!form.city.trim()) e.city = 'Ciudad requerida'
    if (form.bio.length > 2000) e.bio = 'Bio demasiado larga'
    const metaResult = validateMetadataValues(metaFields, metadata, form.category)
    Object.assign(e, metaResult.errors)
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep1 = () => {
    if (files.length < 3) {
      setErrors({ photos: 'Sube al menos 3 fotos' })
      return false
    }
    const batch = validateUploadBatch(files)
    if (!batch.ok) {
      setErrors({ photos: batch.message || 'Archivos inválidos' })
      return false
    }
    setErrors({})
    return true
  }

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) return
    const next: File[] = [...files]
    const nextPrev: string[] = [...previews]
    for (const f of Array.from(list)) {
      const v = validateUploadFile(f)
      if (!v.ok) {
        toast.error('Archivo rechazado', v.message || f.name)
        continue
      }
      if (next.length >= 6) {
        toast.error('Límite', 'Máximo 6 fotos')
        break
      }
      next.push(f)
      nextPrev.push(URL.createObjectURL(f))
    }
    setFiles(next)
    setPreviews(nextPrev)
  }

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setFiles((f) => f.filter((_, i) => i !== idx))
    setPreviews((p) => p.filter((_, i) => i !== idx))
  }

  const submit = async () => {
    if (!validateStep0() || !validateStep1()) {
      setStep(files.length < 3 ? 1 : 0)
      return
    }
    setSubmitting(true)
    try {
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const slugBase = generateSlug(form.display_name) || `provider-${user.id.slice(0, 8)}`
      const slug = provider?.slug || `${slugBase}-${Date.now().toString(36).slice(-4)}`

      const providerPayload = {
        user_id: user.id,
        slug,
        display_name: cleanText(form.display_name),
        category: form.category,
        city: cleanText(form.city),
        bio: cleanText(form.bio),
        whatsapp: cleanText(form.whatsapp),
        instagram: cleanText(form.instagram),
        price_min: form.price_min ? Number(form.price_min) : null,
        status: 'pending' as const,
        rejection_reason: null,
        submitted_at: new Date().toISOString(),
        metadata,
      }

      let providerId = provider?.id

      if (providerId) {
        const { error } = await supabase
          .from('providers')
          .update(providerPayload)
          .eq('id', providerId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('providers')
          .insert(providerPayload)
          .select('id')
          .single()
        if (error) throw error
        providerId = data.id
        await supabase.from('profiles').update({ role: 'provider' }).eq('id', user.id)
      }

      // upload photos
      const photoUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${providerId}/${Date.now()}-${i}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('gallery')
          .upload(path, file, { upsert: false, contentType: file.type })
        if (upErr) throw upErr
        const { data: pub } = supabase.storage.from('gallery').getPublicUrl(path)
        photoUrls.push(pub.publicUrl)
        await supabase.from('gallery').insert({
          provider_id: providerId,
          type: 'image',
          url: pub.publicUrl,
          is_cover: i === 0,
          sort_order: i,
        })
      }

      await supabase
        .from('providers')
        .update({
          photos: photoUrls,
          cover_photo: photoUrls[0] || null,
          status: 'pending',
        })
        .eq('id', providerId)

      if (form.service_name && form.service_price) {
        await supabase.from('services').insert({
          provider_id: providerId,
          name: cleanText(form.service_name),
          price: Number(form.service_price),
          duration: form.service_duration || null,
          is_active: true,
          sort_order: 0,
        })
      }

      // fire-and-forget notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'provider_pending',
            email: profile?.email,
            displayName: form.display_name,
          }),
        })
      } catch {
        /* optional */
      }

      await refreshProfile()
      toast.success('Enviado a moderación', 'Tu aviso quedó en estado PENDING')
      router.push('/dashboard?submitted=1')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error(
        'Error al publicar',
        err instanceof Error ? err.message : 'Revisa Storage y permisos RLS'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Publicar aviso</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Wizard en 3 pasos. Al enviar, el estado será <Badge className="ml-1">PENDING</Badge>
        </p>
      </div>

      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-xs md:text-sm text-center border',
              i === step ? 'border-gold bg-gold/10 text-gold' : 'border-border text-foreground-muted',
              i < step && 'border-success/40 text-success'
            )}
          >
            {i < step ? <Check className="inline h-3 w-3 mr-1" /> : null}
            {label}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{STEPS[step]}</CardTitle>
          <p className="text-sm text-foreground-secondary font-normal mt-1">
            {STEP_HINTS[step]}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <Label htmlFor="display_name">Nombre público</Label>
                <Input
                  id="display_name"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                />
                {errors.display_name && (
                  <p className="text-xs text-error mt-1">{errors.display_name}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masajes">Masajes</SelectItem>
                      <SelectItem value="modelaje">Modelaje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Descripción</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Describe tu servicio (sin HTML)"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="+569..."
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  />
                </div>
              </div>
              {metaFields.map((field) => (
                <div key={field.key}>
                  <Label>
                    {field.label}
                    {field.is_required ? ' *' : ''}
                  </Label>
                  {field.field_type === 'select' && field.options ? (
                    <Select
                      value={String(metadata[field.key] ?? '')}
                      onValueChange={(v) => setMetadata({ ...metadata, [field.key]: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.field_type === 'textarea' ? (
                    <Textarea
                      value={String(metadata[field.key] ?? '')}
                      onChange={(e) =>
                        setMetadata({ ...metadata, [field.key]: e.target.value })
                      }
                    />
                  ) : (
                    <Input
                      type={field.field_type === 'number' ? 'number' : 'text'}
                      value={String(metadata[field.key] ?? '')}
                      onChange={(e) =>
                        setMetadata({
                          ...metadata,
                          [field.key]:
                            field.field_type === 'number'
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  )}
                  {errors[field.key] && (
                    <p className="text-xs text-error mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-foreground-muted">
                Mínimo 3 fotos, máximo 6. Solo JPG/PNG/WebP (≤10MB). Se bloquean .exe/.php/etc.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar fotos
              </Button>
              {errors.photos && <p className="text-sm text-error">{errors.photos}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group"
                  >
                    <Image
                      src={src}
                      alt={`Vista previa ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                    {i === 0 && (
                      <Badge className="absolute top-2 left-2 z-10" variant="gold">
                        Portada
                      </Badge>
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white"
                      onClick={() => removeFile(i)}
                      aria-label={`Quitar foto ${i + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {previews.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-foreground-muted border border-dashed rounded-xl">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    Aún no hay fotos
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <Label htmlFor="price_min">Precio desde (CLP)</Label>
                <Input
                  id="price_min"
                  type="number"
                  value={form.price_min}
                  onChange={(e) => setForm({ ...form, price_min: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <Label>Servicio (opcional)</Label>
                  <Input
                    value={form.service_name}
                    onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    value={form.service_price}
                    onChange={(e) => setForm({ ...form, service_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duración</Label>
                  <Input
                    value={form.service_duration}
                    onChange={(e) => setForm({ ...form, service_duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1">
                <p>
                  <strong>{form.display_name}</strong> · {form.category} · {form.city}
                </p>
                <p>{files.length} fotos listas</p>
                <p className="text-warning">Al enviar → estado PENDING (no visible hasta aprobación)</p>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || submitting}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Atrás
            </Button>
            {step < 2 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 0 && !validateStep0()) return
                  if (step === 1 && !validateStep1()) return
                  setStep((s) => s + 1)
                }}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar a moderación'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
