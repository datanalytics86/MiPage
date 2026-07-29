import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Search,
  ArrowRight,
  Sparkles,
  Shield,
  MessageCircle,
  Star,
  Users,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomeSearch } from '@/components/home/HomeSearch'
import { siteConfig } from '@/lib/site'

const FeaturedProviders = dynamic(
  () =>
    import('@/components/home/FeaturedProviders').then((m) => m.FeaturedProviders),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-portrait rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    ),
  }
)

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

/** Server Component home — hero HTML is in the first HTML byte stream (LCP). */
export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[620px] lg:min-h-[720px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold/5" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(201,169,98,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,165,165,0.08) 0%, transparent 50%)',
          }}
        />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose/10 rounded-full blur-3xl" />

        <div className="container-luxury relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6 border border-gold/20">
              <Shield className="h-4 w-4" aria-hidden />
              {siteConfig.name} — marketplace verificado en Chile
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6">
              Descubre servicios{' '}
              <span className="text-gold">profesionales</span> de confianza
            </h1>

            <p className="text-lg text-foreground-secondary mb-8 max-w-2xl mx-auto">
              {siteConfig.description}
            </p>

            <HomeSearch />

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/explorar/${category.slug}`}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${category.color}`}
                >
                  <span className="text-xl" aria-hidden>
                    {category.icon}
                  </span>
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm text-foreground-secondary"
                >
                  <badge.icon className="h-4 w-4 text-gold" aria-hidden />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background-secondary/60">
        <div className="container-luxury py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {siteConfig.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-gold mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground-secondary">{stat.label}</p>
              </div>
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
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/explorar">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>

          <FeaturedProviders />

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/explorar">
                Ver todos los profesionales
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
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
            {steps.map((step) => (
              <div key={step.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 text-gold mb-6">
                  <step.icon className="h-8 w-8" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-foreground-secondary">{step.description}</p>
              </div>
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
              Únete a nuestra comunidad de profesionales verificados y conecta con
              clientes que buscan calidad.
            </p>
            <Button size="lg" asChild>
              <Link href="/register?type=provider">
                Registrarme como profesional
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
