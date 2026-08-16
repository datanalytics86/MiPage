import React from 'react'
import Link from 'next/link'
import { Instagram, Mail } from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { BrandMark } from '@/components/layout/BrandMark'

export function Footer() {
  return (
    <footer className="bg-background-dark text-foreground">
      <div className="container-luxury py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="MiPage inicio">
              <BrandMark />
            </Link>
            <p className="text-foreground-muted text-sm leading-relaxed max-w-xs">
              Marketplace photo-first de masajes y modelaje en Chile. Revisión humana. Contacto por WhatsApp.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold mb-4">Explorar</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/explorar/masajes" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Masajes
                </Link>
              </li>
              <li>
                <Link href="/explorar/modelaje" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Modelaje
                </Link>
              </li>
              <li>
                <Link href="/explorar" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Ver todos
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Sobre nosotros
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold mb-4">Profesionales</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/register?type=provider" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Únete como profesional
                </Link>
              </li>
              <li>
                <Link
                  href="/login?redirect=/dashboard"
                  className="text-foreground-muted hover:text-gold transition-colors text-sm"
                >
                  Panel de control
                </Link>
              </li>
              <li>
                <Link href="/ayuda" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Centro de ayuda
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold mb-4">Legal</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Términos de servicio
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-foreground-muted hover:text-gold transition-colors text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-foreground-muted text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-gold transition-colors"
              aria-label="Instagram de MiPage"
            >
              <Instagram className="h-5 w-5" aria-hidden />
            </a>
            <a
              href={`mailto:${siteConfig.emails.contact}`}
              className="text-foreground-muted hover:text-gold transition-colors"
              aria-label={`Email ${siteConfig.emails.contact}`}
            >
              <Mail className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
