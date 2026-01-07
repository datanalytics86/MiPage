'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Sparkles, Shield, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProviderCard } from '@/components/providers/ProviderCard'
import type { ProviderCardData } from '@/types'

// Mock data for featured providers
const featuredProviders: ProviderCardData[] = [
  {
    id: '1',
    slug: 'valentina-reyes',
    display_name: 'Valentina Reyes',
    age: 28,
    city: 'Santiago',
    commune: 'Las Condes',
    category: 'masajes',
    is_verified: true,
    is_featured: true,
    average_rating: 4.9,
    review_count: 47,
    price_from: 45000,
    primary_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
  },
  {
    id: '2',
    slug: 'camila-silva',
    display_name: 'Camila Silva',
    age: 24,
    city: 'Santiago',
    commune: 'Providencia',
    category: 'modelaje',
    is_verified: true,
    is_featured: true,
    average_rating: 4.8,
    review_count: 32,
    price_from: 80000,
    primary_image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
  },
  {
    id: '3',
    slug: 'sofia-martinez',
    display_name: 'Sofía Martínez',
    age: 31,
    city: 'Viña del Mar',
    commune: null,
    category: 'masajes',
    is_verified: false,
    is_featured: true,
    average_rating: 4.7,
    review_count: 28,
    price_from: 40000,
    primary_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
  },
  {
    id: '4',
    slug: 'isabella-rojas',
    display_name: 'Isabella Rojas',
    age: 26,
    city: 'Santiago',
    commune: 'Ñuñoa',
    category: 'modelaje',
    is_verified: true,
    is_featured: false,
    average_rating: 4.9,
    review_count: 56,
    price_from: 75000,
    primary_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
  },
]

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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('')

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold/5" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose/20 rounded-full blur-3xl" />
        </div>

        <div className="container-luxury relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Shield className="h-4 w-4" />
              Plataforma 100% verificada
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6"
            >
              Descubre servicios{' '}
              <span className="text-gold">profesionales</span> de confianza
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-foreground-secondary mb-8 max-w-2xl mx-auto"
            >
              La plataforma premium para encontrar masajistas y modelos profesionales en Chile. Perfiles verificados, reseñas reales.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, ciudad o servicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base rounded-2xl shadow-soft-lg"
                />
                <Link href={`/explorar?q=${searchQuery}`} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button size="sm" className="rounded-xl">
                    Buscar
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Category Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {categories.map((category) => (
                <Link key={category.slug} href={`/explorar/${category.slug}`}>
                  <button
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${category.color}`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    {category.name}
                  </button>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
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

      {/* How It Works */}
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
                key={index}
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
                <p className="text-foreground-secondary">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Providers */}
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
