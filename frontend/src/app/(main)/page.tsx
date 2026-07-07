'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Sparkles, Shield, MessageCircle, Star, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { featuredProviders } from '@/lib/mockProviders'
import { siteConfig } from '@/lib/site'

const categories = [
  { name: 'Masajes', slug: 'masajes', icon: '💆', color: 'bg-rose/20 text-rose hover:bg-rose/30' },
  { name: 'Modelaje', slug: 'modelaje', icon: '📸', color: 'bg-gold/20 text-gold hover:bg-gold/30' },
]

const steps = [
  {
    icon: Search,
    title: 'Explora perfiles',
    description: 'Descubre profesionales verificados con fotos, servicios y reseñas reales.',
  },
  {
    icon: MessageCircle,
    title: 'Lee reseñas',
    description: 'Conoce las experiencias de otros clientes antes de decidir.',
  },
  {
    icon: Sparkles,
    title: 'Contacta directo',
    description: 'Comunícate por WhatsApp y coordina tu cita de forma segura.',
  },
]

const trustBadges = [
  { icon: Shield, label: 'Perfiles verificados' },
  { icon: Star, label: 'Reseñas reales' },
  { icon: Users, label: 'Comunidad activa' },
  { icon: MapPin, label: 'Cobertura nacional' },
]

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearch = () => {
    const q = searchQuery.trim()
    router.push(q ? `/explorar?q=${encodeURIComponent(q)}` : '/explorar')
  }

  return (
    <div>
      <section className="relative min-h-[620px] lg:min-h-[720px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold/8" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(201,169,98,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,165,165,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose/20 rounded-full blur-3xl" />

        <div className="container-luxury relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6 border border-gold/20"
            >
              <Shield className="h-4 w-4" />
              {siteConfig.name} — marketplace verificado en Chile
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6"
            >
              Descubre servicios{' '}
              <span className="text-gold">profesionales</span> de confianza
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-foreground-secondary mb-8 max-w-2xl mx-auto"
            >
              {siteConfig.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-xl mx-auto mb-6"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearch()
                }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, ciudad o servicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-28 h-14 text-base rounded-2xl shadow-soft-lg border-gold/20 focus-visible:ring-gold/40"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
                >
                  Buscar
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {categories.map((category) => (
                <Link key={category.slug} href={`/explorar/${category.slug}`}>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${category.color}`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    {category.name}
                  </button>
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6"
            >
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm text-foreground-secondary"
                >
                  <badge.icon className="h-4 w-4 text-gold" />
                  {badge.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background-secondary/60">
        <div className="container-luxury py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {siteConfig.stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-semibold text-gold mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground-secondary">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background-secondary">
        <div className="container-luxury">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
                Profesionales destacados
              </h2>
              <p className="text-foreground-secondary">
                Los mejor valorados por nuestra comunidad
              </p>
            </div>
            <Link href="/explorar">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProviderCard provider={provider} />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/explorar">
              <Button variant="outline">
                Ver todos los profesionales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold text-foreground mb-4">
              Cómo funciona
            </h2>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Encuentra al profesional perfecto en tres simples pasos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 text-gold mb-6">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-foreground-secondary">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background-dark">
        <div className="container-luxury">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              ¿Ofreces servicios profesionales?
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Únete a nuestra comunidad de profesionales verificados y conecta con clientes que buscan calidad.
            </p>
            <Link href="/register?type=provider">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-white">
                Registrarme como profesional
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}