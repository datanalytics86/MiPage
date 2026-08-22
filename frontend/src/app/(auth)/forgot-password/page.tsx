'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // MIP-009: Resend is off. Do not call resetPasswordForEmail.
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Reset acceso',
          email: email.trim(),
          reason: 'support',
          message: `Pedido de reset de acceso para ${email.trim()}. El envío de mail está apagado.`,
        }),
      })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-border/60 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-display text-2xl">Recuperar contraseña</CardTitle>
          <p className="text-sm text-foreground-secondary">
            El envío de mail está apagado. No va a llegar un enlace. Pide al operador que resetee el
            acceso.
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-foreground-secondary">
                Pedido anotado. No salió ningún correo.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Volver al login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
                {isLoading ? 'Anotando…' : 'Pedir reset'}
              </Button>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gold hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Volver al login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
