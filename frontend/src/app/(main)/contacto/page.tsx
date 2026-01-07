'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, MessageSquare, HelpCircle, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const contactReasons = [
  { id: 'general', label: 'Consulta general', icon: MessageSquare },
  { id: 'support', label: 'Soporte técnico', icon: HelpCircle },
  { id: 'report', label: 'Reportar un problema', icon: Flag },
]

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'general',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    setSubmitted(true)
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="container-luxury py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <Send className="h-10 w-10 text-success" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
            ¡Mensaje enviado!
          </h1>
          <p className="text-foreground-secondary mb-8">
            Gracias por contactarnos. Te responderemos lo antes posible a tu correo electrónico.
          </p>
          <Button onClick={() => setSubmitted(false)}>
            Enviar otro mensaje
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container-luxury py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-semibold text-foreground mb-4">
            Contáctanos
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte.
            Completa el formulario y te responderemos lo antes posible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a
                      href="mailto:contacto@luxeservices.com"
                      className="text-foreground-secondary hover:text-gold transition-colors"
                    >
                      contacto@luxeservices.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Ubicación</h3>
                    <p className="text-foreground-secondary">
                      Santiago, Chile
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Horario de atención</h3>
                    <p className="text-foreground-secondary">
                      Lunes a Viernes<br />
                      9:00 - 18:00 hrs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Envíanos un mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Reason Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Motivo del contacto
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {contactReasons.map((reason) => (
                        <button
                          key={reason.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, reason: reason.id })}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                            formData.reason === reason.id
                              ? 'border-gold bg-gold/5'
                              : 'border-border hover:border-gold/50'
                          )}
                        >
                          <reason.icon className={cn(
                            'h-6 w-6',
                            formData.reason === reason.id ? 'text-gold' : 'text-foreground-muted'
                          )} />
                          <span className={cn(
                            'text-sm font-medium',
                            formData.reason === reason.id ? 'text-gold' : 'text-foreground-secondary'
                          )}>
                            {reason.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Nombre
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Correo electrónico
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-luxury resize-none w-full"
                      rows={6}
                      placeholder="Escribe tu mensaje aquí..."
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
