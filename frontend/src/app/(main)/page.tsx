'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Sparkles, Shield, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { useFeaturedProviders } from '@/hooks/useProviders'
import type { ProviderCardData } from '@/types'
import type { Provider as ProviderRow } from '@/types/database'

const mapProviderToCard = (provider: ProviderRow): ProviderCardData => ({
  id: provider.id,
  slug: provider.slug,
  display_name: provider.display_name,
  age: provider.age ?? 18,
  city: provider.city,
  commune: null,
  category: provider.category === 'modelaje' ? 'modelaje' : 'masajes',
  is_verified: provider.is_verified,
  is_featured: provider.is_featured,
  average_rating: provider.rating ?? 0,
  review_count: provider.review_count ?? 0,
  price_from: provider.price_min ?? 0,
  primary_image: provider.cover_photo,
})

export default function HomePage() {
  const { data: featured = [], isLoading } = useFeaturedProviders(8)
  const featuredProviders = featured.map(mapProviderToCard)

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1920"
            alt="Luxury background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
        </div>

        <div className="relative z-10 container-luxury py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white mb-6">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-sm">Plataforma premium en Chile</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-white mb-6 leading-tight">
              Encuentra servicios
              <span className="block text-gold">de lujo cerca de ti</span>
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Conecta con profesionales verificadas en modelaje y masajes.
              Reserva de forma segura y discreta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/explorar">
                <Button size="lg" className="min-w-[200px]">
                  Explorar perfiles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sobre-nosotros">
                <Button size="lg" variant="outline" className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Conocer más
                </Button>
              </Link>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o ciudad..."
                  className="pl-12 h-14 text-base bg-white shadow-soft"
                  onFocus={() => (window.location.href = '/explorar')}
                  readOnly
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <Shield className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-display text-xl font-medium mb-2">Perfiles Verificados</h3>
              <p className="text-foreground-secondary">Todas las profesionales pasan por un proceso de verificación riguroso</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
                <MessageCircle className="h-7 w-7 text-sage-dark" />
              </div>
              <h3 className="font-display text-xl font-medium mb-2">Contacto Directo</h3>
              <p className="text-foreground-secondary">Comunícate directamente por WhatsApp de forma segura y privada</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blush/30 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-blush-dark" />
              </div>
              <h3 className="font-display text-xl font-medium mb-2">Experiencia Premium</h3>
              <p className="text-foreground-secondary">Disfruta de servicios de alta calidad con las mejores profesionales</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-luxury">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">Profesionales Destacadas</h2>
              <p className="text-foreground-secondary">Las mejor valoradas por nuestra comunidad</p>
            </div>
            <Link href="/explorar">
              <Button variant="ghost" className="hidden sm:flex">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Cargando destacadas...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProviderCard provider={provider} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link href="/explorar">
              <Button>
                Ver todas las profesionales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
