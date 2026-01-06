'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isProvider = searchParams.get('type') === 'provider'

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isProvider: isProvider,
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

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      // TODO: Implement actual registration with Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect based on user type
      if (formData.isProvider) {
        router.push('/dashboard/perfil')
      } else {
        router.push('/')
      }
    } catch (err) {
      setErrors({ general: 'Error al crear la cuenta. Por favor intenta de nuevo.' })
    } finally {
      setIsLoading(false)
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                {errors.general}
              </div>
            )}

            {/* Full Name */}
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
              {errors.fullName && (
                <p className="text-sm text-error">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
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
              {errors.email && (
                <p className="text-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Password */}
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
              {errors.password && (
                <p className="text-sm text-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
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

            {/* Provider Checkbox */}
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

            {/* Terms Checkbox */}
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
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" className="text-gold hover:underline">
                  política de privacidad
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-error">{errors.acceptTerms}</p>
            )}

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
