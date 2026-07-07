import { Metadata } from 'next'
import Link from 'next/link'
import {
  HelpCircle,
  Search,
  Heart,
  Shield,
  MessageCircle,
  UserPlus,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Centro de Ayuda',
  description: `Preguntas frecuentes y guías para usar ${siteConfig.name}`,
}

const faqs = [
  {
    question: '¿Cómo busco un profesional?',
    answer:
      'Usa la barra de búsqueda en la página de inicio o en Explorar. Puedes filtrar por categoría (masajes o modelaje), ciudad y solo perfiles verificados.',
  },
  {
    question: '¿Cómo contacto a un profesional?',
    answer:
      'Entra al perfil del profesional y usa el botón de WhatsApp para coordinar directamente. MiPage no gestiona pagos ni citas.',
  },
  {
    question: '¿Cómo guardo favoritos?',
    answer:
      'Inicia sesión y pulsa el ícono de corazón en cualquier tarjeta de profesional. Tus favoritos quedan guardados en tu cuenta.',
  },
  {
    question: '¿Cómo me registro como profesional?',
    answer:
      'Haz clic en "Registrarme como profesional" y completa tu perfil. Nuestro equipo revisará tu información antes de publicarla.',
  },
  {
    question: '¿Qué significa el sello verificado?',
    answer:
      'Indica que el profesional pasó una revisión de identidad y cumple con los estándares de calidad de MiPage.',
  },
]

const guides = [
  {
    icon: Search,
    title: 'Explorar perfiles',
    description: 'Encuentra profesionales por categoría, ciudad o nombre.',
    href: '/explorar',
  },
  {
    icon: Heart,
    title: 'Gestionar favoritos',
    description: 'Guarda y compara los perfiles que más te interesan.',
    href: '/favoritos',
  },
  {
    icon: UserPlus,
    title: 'Registro de profesionales',
    description: 'Publica tu perfil y llega a nuevos clientes.',
    href: '/register?type=provider',
  },
  {
    icon: Shield,
    title: 'Seguridad y confianza',
    description: 'Conoce cómo verificamos perfiles y moderamos contenido.',
    href: '/sobre-nosotros',
  },
]

export default function AyudaPage() {
  return (
    <div>
      <section className="relative py-16 bg-gradient-to-b from-gold/5 to-transparent">
        <div className="container-luxury">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold mb-6">
              <HelpCircle className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl font-semibold text-foreground mb-4">
              Centro de ayuda
            </h1>
            <p className="text-foreground-secondary text-lg">
              Encuentra respuestas rápidas sobre cómo usar {siteConfig.name}
            </p>
          </div>
        </div>
      </section>

      <section className="container-luxury pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {guides.map((guide) => (
            <Link key={guide.title} href={guide.href}>
              <Card className="h-full hover:shadow-soft-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <guide.icon className="h-8 w-8 text-gold mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary">{guide.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-6">
                  <h3 className="font-medium text-foreground mb-2">{faq.question}</h3>
                  <p className="text-foreground-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background-secondary border-t border-border">
        <div className="container-luxury py-12">
          <div className="max-w-xl mx-auto text-center">
            <MessageCircle className="h-10 w-10 text-gold mx-auto mb-4" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-foreground-secondary mb-6">
              Nuestro equipo de soporte está disponible para ayudarte.
            </p>
            <Link href="/contacto">
              <Button>
                Contactar soporte
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-foreground-muted mt-4">
              También puedes escribirnos a{' '}
              <a
                href={`mailto:${siteConfig.emails.support}`}
                className="text-gold hover:underline"
              >
                {siteConfig.emails.support}
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}