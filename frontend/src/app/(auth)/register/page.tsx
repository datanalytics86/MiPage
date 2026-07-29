'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { filterCities } from '@/lib/filters'
import type { ProviderCategory } from '@/types'

const REGISTER_CITIES = filterCities.filter((city) => city !== 'Todas')

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useAuth()
  const isProviderFromUrl =
    searchParams.get('type') === 'provider' || searchParams.get('role') === 'provider'

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isProvider: isProviderFromUrl,
    category: 'masajes' as ProviderCategory,
    city: 'Santiago',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (formData.isProvider && !formData.city.trim()) {
      newErrors.city = 'Selecciona una ciudad'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms =
        'Debes aceptar términos, privacidad y tratamiento de datos (Ley 19.628)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      const { error: authError, needsEmailConfirmation } = await signUp(
        formData.email,
        formData.password,
        {
          name: formData.fullName,
          role: formData.isProvider ? 'provider' : 'user',
          category: formData.isProvider ? formData.category : undefined,
          city: formData.isProvider ? formData.city : undefined,
        }
      )

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErrors({ email: 'Este correo ya está registrado' })
        } else {
          setErrors({ general: 'Error al crear la cuenta. Por favor intenta de nuevo.' })
        }
        return
      }

      if (needsEmailConfirmation) {
        setPendingEmailConfirmation(true)
        setRegistrationComplete(true)
        return
      }

      if (formData.isProvider) {
        router.push('/dashboard/perfil?welcome=pending')
      } else {
        router.push('/')
      }
      router.refresh()
    } catch {
      setErrors({ general: 'Error al crear la cuenta. Por favor intenta de nuevo.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-soft-lg">
          <CardContent className="pt-10 pb-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-display text-2xl font-semibold">¡Cuenta creada!</h2>
            {pendingEmailConfirmation ? (
              <p className="text-foreground-secondary text-sm">
                Revisa tu correo <strong>{formData.email}</strong> y confirma tu cuenta antes de
                iniciar sesión.
              </p>
            ) : (
              <p className="text-foreground-secondary text-sm">
                Tu cuenta fue creada correctamente.
              </p>
            )}
            {formData.isProvider && (
              <div className="p-4 rounded-xl bg-warning/10 text-left text-sm text-foreground-secondary">
                <p className="font-medium text-warning flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  Perfil pendiente de aprobación
                </p>
                <p className="mt-2">
                  Cuando confirmes tu correo podrás acceder al dashboard y completar tu perfil. Un
                  administrador revisará tu solicitud antes de publicarla en el sitio.
                </p>
              </div>
            )}
            <Link href="/login">
              <Button className="w-full" size="lg">
                Ir a iniciar sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-soft-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-display text-3xl">Crear cuenta</CardTitle>
          <p className="text-foreground-secondary mt-2">
            {formData.isProvider
              ? 'Regístrate como profesional'
              : 'Únete a nuestra comunidad'}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {formData.isProvider && (
            <div className="mb-4 p-4 rounded-xl bg-warning/10 border border-warning/20 text-sm">
              <p className="font-medium text-warning flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                Aprobación requerida
              </p>
              <p className="text-foreground-secondary mt-1">
                Tu perfil quedará en estado <strong>pendiente</strong> hasta que un administrador lo
                apruebe. Mientras tanto podrás configurar servicios y galería en tu dashboard.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={cn('pl-10', errors.fullName && 'border-error')}
                />
              </div>
              {errors.fullName && <p className="text-sm text-error">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn('pl-10', errors.email && 'border-error')}
                />
              </div>
              {errors.email && <p className="text-sm text-error">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={cn('pl-10 pr-10', errors.password && 'border-error')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-error">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={cn('pl-10', errors.confirmPassword && 'border-error')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-error">{errors.confirmPassword}</p>
              )}
            </div>

            {formData.isProvider && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Categoría</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['masajes', 'modelaje'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={cn(
                          'px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                          formData.category === cat
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-border hover:border-gold/50'
                        )}
                      >
                        {cat === 'masajes' ? '💆 Masajes' : '📸 Modelaje'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-foreground">
                    Ciudad
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={cn(
                        'w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm',
                        errors.city && 'border-error'
                      )}
                    >
                      {REGISTER_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.city && <p className="text-sm text-error">{errors.city}</p>}
                </div>
              </>
            )}

            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:border-gold/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.isProvider}
                onChange={(e) => setFormData({ ...formData, isProvider: e.target.checked })}
                className="mt-1 rounded border-border text-gold focus:ring-gold"
              />
              <div>
                <span className="font-medium text-foreground">
                  Quiero registrarme como profesional
                </span>
                <p className="text-sm text-foreground-secondary mt-0.5">
                  Podré publicar mis servicios y recibir clientes
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className={cn(
                  'mt-1 rounded border-border text-gold focus:ring-gold',
                  errors.acceptTerms && 'border-error'
                )}
              />
              <span className="text-sm text-foreground-secondary">
                Acepto los{' '}
                <Link href="/terminos" className="text-gold hover:underline">
                  términos de servicio
                </Link>
                , la{' '}
                <Link href="/privacidad" className="text-gold hover:underline">
                  política de privacidad
                </Link>{' '}
                y el tratamiento de mis datos personales conforme a la{' '}
                <strong>Ley 19.628</strong> (Chile). Puedo solicitar eliminación en{' '}
                <Link href="/privacidad#derechos" className="text-gold hover:underline">
                  mis derechos
                </Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-sm text-error">{errors.acceptTerms}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground-secondary text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-gold font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RegisterFallback() {
  return (
    <div className="w-full max-w-md">
      <Card className="shadow-soft-lg">
        <CardContent className="py-16 text-center text-foreground-secondary">
          Cargando formulario...
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  )
}