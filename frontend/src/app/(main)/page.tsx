import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, Shield, Star, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProviderGridSkeleton } from '@/components/ui/Skeleton'
import { HomeSearch } from '@/components/home/HomeSearch'
import { HomeStats } from '@/components/home/HomeStats'
import { siteConfig } from '@/lib/site'

const FeaturedProviders = dynamic(
  () =>
    import('@/components/home/FeaturedProviders').then((m) => m.FeaturedProviders),
  {
    loading: () => <ProviderGridSkeleton count={4} />,
  }
)

function MarkMasajes() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden fill="none">
      <path
        d="M3 12c2.4-3.2 4.2-3.2 6.6 0 2.4 3.2 4.2 3.2 6.6 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M5 8c1.6-2 2.8-2 4.4 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  )
}

function MarkModelaje() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden fill="none">
      <rect x="3.2" y="4.2" width="13.6" height="11.6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="10" r="2.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

const categories = [
  { name: 'Masajes', slug: 'masajes', Mark: MarkMasajes },
  { name: 'Modelaje', slug: 'modelaje', Mark: MarkModelaje },
]

const steps = [
  {
    title: 'Explora perfiles',
    description: 'Mira fotos, ciudad, precios y reseñas de profesionales de masajes y modelaje.',
  },
  {
    title: 'Lee reseñas',
    description: 'Las reseñas las escriben clientes con cuenta. Si no hay, se muestra —.',
  },
  {
    title: 'Contacta por WhatsApp',
    description: 'Escribes directo al profesional. MiPage no intermedia el chat.',
  },
]

const trustBadges = [
  { icon: Shield, label: 'Revisión humana antes de publicar' },
  { icon: Star, label: 'Reseñas de clientes' },
  { icon: Users, label: 'Un operador, sin bots de aprobación' },
  { icon: MapPin, label: 'Chile' },
]

/** Server Component home — hero HTML is in the first HTML byte stream (LCP). */
export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[580px] lg:min-h-[680px] flex items-center overflow-hidden">
        <div className="container-luxury relative z-10 py-16 lg:py-24">
          <div className="max-w-2xl lg:pl-6 lg:border-l lg:border-gold/25">
            <p className="reveal text-[11px] uppercase tracking-[0.22em] text-gold mb-5">
              Chile · masajes y modelaje
            </p>

            <h1 className="reveal reveal-2 font-display text-4xl md:text-5xl lg:text-[3.4rem] font-semibold text-foreground leading-[1.08] mb-6">
              Servicios{' '}
              <span className="text-gold italic font-medium">profesionales</span>
              <br className="hidden sm:block" />{' '}
              de confianza
            </h1>

            <p className="reveal reveal-3 text-lg text-foreground-secondary mb-8 max-w-xl">
              {siteConfig.description}
            </p>

            <div className="reveal reveal-3 mb-8">
              <HomeSearch />
            </div>

            <div className="reveal reveal-4 flex flex-wrap gap-3 mb-10">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/explorar/${category.slug}`}
                  className="chip-tactile"
                >
                  <category.Mark />
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="reveal reveal-4 flex flex-wrap gap-x-5 gap-y-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm text-foreground-secondary"
                >
                  <badge.icon className="h-3.5 w-3.5 text-gold" aria-hidden />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeStats />

      <section className="section-padding bg-background-secondary">
        <div className="container-luxury">
          <div className="flex items-end justify-between mb-10 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold mb-2">Selección</p>
              <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
                Profesionales destacados
              </h2>
              <p className="text-foreground-secondary">
                Perfiles con badge Destacado. Si aún no hay, verás un vacío honesto.
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
          <div className="max-w-xl mb-12">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold mb-2">Proceso</p>
            <h2 className="font-display text-3xl font-semibold text-foreground mb-4">
              Cómo funciona
            </h2>
            <p className="text-foreground-secondary">
              Tres pasos. Sin chat interno. Sin intermediario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {steps.map((step, i) => (
              <div key={step.title} className="md:pr-4">
                <p className="font-display text-3xl text-gold/40 mb-3">0{i + 1}</p>
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
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              ¿Ofreces servicios profesionales?
            </h2>
            <p className="text-foreground-secondary mb-8 text-lg">
              Publica tu aviso con fotos, espera una revisión humana y aparece en
              Explorar. El contacto llega por WhatsApp.
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
